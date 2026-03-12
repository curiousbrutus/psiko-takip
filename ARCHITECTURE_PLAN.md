# Psikotakip — Architecture Migration Plan

> **Purpose**: This document is the source of truth for the planned architectural migration of the Psikotakip platform. Any AI agent or developer picking up this project should read this first before making structural changes.

---

## 1. Current State

### Stack
| Layer | Technology |
|---|---|
| Frontend + BFF | Next.js 15 (App Router, TypeScript) |
| Backend API | Next.js API Routes (`src/app/api/**`) |
| Database | Oracle 12c (local, `oracledb` Node driver) |
| AI / Chatbot | Google Genkit + Gemini |
| Auth | JWT (bcryptjs + jsonwebtoken) |
| Styling | Tailwind CSS + Radix UI |

### API Surface (14 endpoints)
```
/api/auth/login, register, logout, refresh, me
/api/users/profile, password, clients, clients/[id], search
/api/mood-entries
/api/journal-entries
/api/gamification, gamification/companion
/api/assessment-tasks, assessment-tasks/[taskId]
/api/assessment-results
/api/collaborative-tasks, collaborative-tasks/[taskId]
/api/appointments
/api/test-submissions
/api/gratitude-entries
/api/health
```

### Database Tables (all use `PSK_EBG_` prefix)
```
PSK_EBG_USERS             PSK_EBG_USER_SESSIONS
PSK_EBG_GAMIFICATION      PSK_EBG_MOOD_ENTRIES
PSK_EBG_JOURNAL_ENTRIES   PSK_EBG_TEST_SUBMISSIONS
PSK_EBG_ASSESSMENT_TASKS  PSK_EBG_ASSESSMENT_RESULTS
PSK_EBG_COLLABORATIVE_TASKS  PSK_EBG_APPOINTMENTS
PSK_EBG_CHAT_MESSAGES     PSK_EBG_AUDIT_LOG
PSK_EBG_SYSTEM_CONFIG     PSK_EBG_GRATITUDE_ENTRIES
```

### Repository Pattern (already implemented)
```
src/lib/database/
  config.ts                  ← Oracle pool, executeQuery(), generateId()
  users.repository.ts        ← User CRUD + SP wrappers
  mood.repository.ts         ← Mood entry CRUD
  journal.repository.ts      ← Journal entry CRUD
  gamification.repository.ts ← XP, level, streak, companion
```

---

## 2. Target Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     CLIENTS                                  │
│  Next.js Web App (desktop browser)  │  React Native Mobile   │
│  Port 9002 (existing)               │  iOS + Android         │
└────────────────┬───────────────────────────┬─────────────────┘
                 │ HTTP/REST + JWT            │ HTTP/REST + JWT
                 ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│              NestJS REST API  (Port 3001)                   │
│                                                             │
│  AuthModule       UsersModule     GamificationModule        │
│  MoodModule       JournalModule   AssessmentModule          │
│  AppointmentsModule              CollaborativeTasksModule   │
│  GratitudeModule  ChatModule      AuditModule               │
│                                                             │
│  Guards: JwtAuthGuard, RolesGuard                           │
│  Interceptors: LoggingInterceptor, TransformInterceptor     │
│  Pipes: ValidationPipe (class-validator)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ oracledb
                           ▼
┌──────────────────────────────────────────────┐
│          Oracle 12c Database                 │
│    All tables with PSK_EBG_ prefix           │
│    Stored procedures: SP_* family            │
└──────────────────────────────────────────────┘
                           │
                           │ HTTP (Genkit)
                           ▼
┌──────────────────────────────────────────────┐
│    Google Genkit + Gemini AI Service         │
│    (keep as-is — already works well)         │
└──────────────────────────────────────────────┘
```

---

## 3. Migration Phases

### Phase 1 — Shared Types Package (Week 1)
**Goal**: Create a shared TypeScript types package used by both web and mobile.

**Create**: `packages/shared/` (monorepo using npm workspaces or Turborepo)

```
packages/shared/src/
  types/
    user.types.ts         ← User, Role, UserStatus
    auth.types.ts         ← LoginRequest, TokenPair, JwtPayload
    mood.types.ts         ← MoodEntry, MoodPeriod
    journal.types.ts      ← JournalEntry
    gamification.types.ts ← GamificationData, Companion
    assessment.types.ts   ← AssessmentTask, AssessmentResult
    appointment.types.ts  ← Appointment
    test.types.ts         ← TestSubmission, TestScore
    gratitude.types.ts    ← GratitudeEntry
    api.types.ts          ← ApiResponse<T>, PaginatedResponse<T>
  constants/
    roles.ts              ← ROLES: danisan, terapist, kurum_yoneticisi
    test-names.ts         ← TEST_NAMES: beck-depression-inventory etc.
```

**Key types to define** (copy from existing `src/types/`):
```typescript
// api.types.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// user.types.ts
export type UserRole = 'danisan' | 'terapist' | 'kurum_yoneticisi';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export interface User {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  connectedTherapistId?: string;
}
```

---

### Phase 2 — NestJS Backend (Weeks 2–4)
**Goal**: Extract all Oracle data access + business logic from Next.js API routes into a dedicated NestJS service.

**Create**: `apps/api/` (NestJS app)

#### 2.1 Project Setup
```bash
cd apps
npx @nestjs/cli new api --package-manager npm
cd api
npm install @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt
npm install class-validator class-transformer oracledb bcryptjs jsonwebtoken
npm install -D @types/oracledb @types/bcryptjs @types/jsonwebtoken
```

#### 2.2 Module Structure
```
apps/api/src/
  main.ts                           ← Bootstrap, port 3001
  app.module.ts                     ← Root module
  config/
    oracle.config.ts                ← OracleConfig (from .env)
    jwt.config.ts                   ← JwtConfig
  database/
    oracle.module.ts                ← Global OracleModule (connection pool)
    oracle.service.ts               ← executeQuery(), generateId() wrappers
    repositories/
      users.repository.ts           ← COPY from src/lib/database/users.repository.ts
      mood.repository.ts            ← COPY
      journal.repository.ts         ← COPY
      gamification.repository.ts    ← COPY
      assessment.repository.ts      ← NEW (from inline SQL in route.ts files)
      appointment.repository.ts     ← NEW
      gratitude.repository.ts       ← NEW
      chat.repository.ts            ← NEW
  auth/
    auth.module.ts
    auth.service.ts                 ← login, register, refresh (from route.ts files)
    auth.controller.ts              ← POST /auth/login, register, logout, refresh
    jwt.strategy.ts                 ← Passport JWT strategy
    jwt-auth.guard.ts               ← JwtAuthGuard
    roles.guard.ts                  ← RolesGuard + @Roles() decorator
    dto/
      login.dto.ts                  ← class-validator decorators
      register.dto.ts
  users/
    users.module.ts
    users.service.ts
    users.controller.ts             ← GET/PATCH /users/profile, /users/clients
    dto/
      update-profile.dto.ts
      change-password.dto.ts
  mood/
    mood.module.ts
    mood.service.ts
    mood.controller.ts              ← GET/POST /mood-entries
    dto/
      create-mood.dto.ts
  journal/
    journal.module.ts
    journal.service.ts
    journal.controller.ts           ← GET/POST /journal-entries
    dto/
      create-journal.dto.ts
  gamification/
    gamification.module.ts
    gamification.service.ts
    gamification.controller.ts      ← GET/POST /gamification, /gamification/companion
  assessment/
    assessment.module.ts
    assessment.service.ts
    assessment.controller.ts        ← CRUD /assessment-tasks, /assessment-results
  appointments/
    appointments.module.ts
    appointments.service.ts
    appointments.controller.ts      ← CRUD /appointments
  tests/
    tests.module.ts
    tests.service.ts
    tests.controller.ts             ← GET/POST /test-submissions
  gratitude/
    gratitude.module.ts
    gratitude.service.ts
    gratitude.controller.ts         ← GET/POST /gratitude-entries
  collaborative-tasks/
    collaborative-tasks.module.ts
    collaborative-tasks.service.ts
    collaborative-tasks.controller.ts
  ai/
    ai.module.ts
    ai.service.ts                   ← Proxy to Genkit (keep Genkit as-is)
```

#### 2.3 Environment Variables for NestJS (`apps/api/.env`)
```env
# Oracle
ORACLE_USER=FTH
ORACLE_PASSWORD=FTH34OPT
ORACLE_CONNECTION_STRING=BYZDB
ORACLE_POOL_MIN=2
ORACLE_POOL_MAX=10

# JWT (same secrets as Next.js)
JWT_SECRET=psikotakip-jwt-secret-key-2024-local
JWT_REFRESH_SECRET=psikotakip-refresh-secret-key-2024-local
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# App
PORT=3001
NODE_ENV=development
```

#### 2.4 CORS Configuration (Allow both web and mobile)
```typescript
// main.ts
app.enableCors({
  origin: ['http://localhost:9002', 'http://localhost:3000'],
  credentials: true,
});
```

#### 2.5 SQL Column Mapping Reference (IMPORTANT — known issues)
> The Oracle schema uses non-standard column names that differ from what you might expect. Always refer to this table:

| Table | Column in Oracle | Previously mistaken as |
|---|---|---|
| `psk_ebg_assessment_tasks` | `assigned_at` | `created_at` |
| `psk_ebg_test_submissions` | `submitted_at` | `created_at` |
| `psk_ebg_gamification` | `user_level` | `level` |

---

### Phase 3 — Next.js Web App Refactor (Week 4–5)
**Goal**: Remove all API route handler files from Next.js. Next.js becomes a pure frontend that calls the NestJS API.

**Changes to existing Next.js app (`apps/web/`)**:

1. **Remove** `src/app/api/**` directory entirely
2. **Update** `NEXT_PUBLIC_API_URL` in `.env` to point to NestJS: `http://localhost:3001`
3. **Create** `src/lib/api-client.ts` — a typed fetch wrapper:
```typescript
// src/lib/api-client.ts
export class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL;

  async get<T>(path: string, token?: string): Promise<ApiResponse<T>> { ... }
  async post<T>(path: string, body: unknown, token?: string): Promise<ApiResponse<T>> { ... }
  async patch<T>(path: string, body: unknown, token?: string): Promise<ApiResponse<T>> { ... }
  async delete<T>(path: string, token?: string): Promise<ApiResponse<T>> { ... }
}
```
4. **Migrate** all `fetch('/api/...')` calls in hooks and server actions to use `ApiClient`
5. **Keep** Genkit AI flows (`src/ai/`) in the Next.js app OR move to NestJS `ai` module

---

### Phase 4 — React Native Mobile App (Weeks 5–8)
**Goal**: Build a React Native app for iOS and Android using Expo.

**Create**: `apps/mobile/` (Expo app)

#### 4.1 Setup
```bash
cd apps
npx create-expo-app mobile --template blank-typescript
cd mobile
npx expo install expo-router expo-secure-store @react-native-async-storage/async-storage
npm install axios react-query @tanstack/react-query
```

#### 4.2 Reused from Web
- **All types** from `packages/shared/` 
- **API client logic** (Axios-based adapter)
- **Business logic hooks** (with minor adjustments for RN)

#### 4.3 Mobile-Specific Screens to Build
```
apps/mobile/app/
  (auth)/
    login.tsx               ← Login screen
    register.tsx            ← Register screen (simplified — role selection)
  (tabs)/
    index.tsx               ← Home / Daily Journey
    mood.tsx                ← Mood Entry
    journal.tsx             ← Journal
    tests.tsx               ← Psychological tests list
    profile.tsx             ← Profile settings
  therapist/
    clients.tsx             ← Client list (terapist role only)
    client/[id].tsx         ← Client detail + test assignments
    calendar.tsx            ← Appointment calendar
  assistant/
    index.tsx               ← AI Chatbot (Gemini via NestJS)
```

#### 4.4 Key Mobile Libraries
| Need | Library |
|---|---|
| Navigation | `expo-router` (file-based, like Next.js) |
| Auth token storage | `expo-secure-store` |
| API calls | `axios` |
| Server state | `@tanstack/react-query` |
| Calendar UI | `react-native-calendars` |
| Charts | `react-native-gifted-charts` |
| Notifications | `expo-notifications` |

---

### Phase 5 — Monorepo Structure (Final)
```
psiko-takip/
  apps/
    web/          ← Next.js 15 (web frontend only, no API routes)
    api/          ← NestJS REST API (port 3001)
    mobile/       ← Expo / React Native
  packages/
    shared/       ← TypeScript types, constants, utilities
  database/       ← Oracle SQL scripts (already exist)
  docker/         ← Optional: Dockerfile for NestJS API
  package.json    ← Workspace root
  turbo.json      ← Turborepo config (optional)
```

---

## 4. Migration Order for Agents

Each agent working on this project should follow this priority order:

| Priority | Task | Status |
|---|---|---|
| ✅ DONE | Apply `PSK_EBG_` prefix to all Oracle tables | Complete |
| ✅ DONE | Implement Repository pattern (mood, journal, gamification, users) | Complete |
| ✅ DONE | Create `psk_ebg_gratitude_entries` table | Complete |
| ✅ DONE | Fix ORA-00904 column name mismatches in API routes | Complete |
| ✅ DONE | **Phase 1** — Create `packages/shared/` with all shared TypeScript types | Complete |
| 🟡 IN PROGRESS | **Phase 2** — Create NestJS `apps/api/` project and migrate all API routes | In progress |
| 🟡 IN PROGRESS | **Phase 3** — Refactor Next.js web app to call NestJS instead of local API routes | In progress |
| 🔲 | **Phase 4** — Create React Native `apps/mobile/` with Expo Router | Pending |
| 🔲 | **Phase 5** — Consolidate into monorepo with Turborepo | Pending |

### Current Backend Migration Snapshot (March 2026)

Migrated to NestJS (`apps/api`) and running:

- Auth: `login/register/refresh/logout/me`
- Users: `profile/password/clients/clients/:clientId/search`
- Mood, Journal, Gratitude
- Gamification + Companion
- Appointments
- Assessment Tasks + Results
- Collaborative Tasks
- Test Submissions

Remaining Next.js route in active use:

- `/api/health` (temporary local health route)

Notes:

- Legacy duplicated Next.js route handlers for migrated endpoints are removed.
- Web client routing now uses `NEXT_PUBLIC_API_URL=http://localhost:3001` for migrated endpoint prefixes.

---

## 5. Rules for All Agents

1. **Never remove the `PSK_EBG_` prefix** from any Oracle table name.
2. **All new tables must be created** in the `database/schema.sql` file AND applied to the running Oracle DB.
3. **All SQL column aliases** in queries must use lowercase camelCase with double-quoted aliases (e.g., `user_id as "userId"`) — Oracle returns uppercase by default otherwise.
4. **Never store secrets** in code. All credentials come from `.env`.
5. **JWT tokens** are issued as Access Token (15min) + Refresh Token (7d). Always validate with `JwtAuthGuard`.
6. **User roles**: `danisan` (patient), `terapist` (therapist), `kurum_yoneticisi` (institution admin).
7. **The AI chatbot** (`src/ai/`) uses Genkit + Gemini and should remain isolated from business logic.
8. When creating a **new API endpoint**, always create:
   - A repository method in `src/lib/database/*.repository.ts`
   - A NestJS module + service + controller + DTO (Phase 2+)
   - Unit tests in `__tests__/` for the repository

---

## 6. Known Issues & Gotchas

| Issue | Details |
|---|---|
| `oracledb` native bindings | Requires Oracle Instant Client installed on the host machine. Path: typically `C:\oracle\instantclient_21_x` |
| Oracle 12c limitations | No `JSON_OBJECT()` in some editions — use string concat for JSON in procedures |
| `user_level` column | `psk_ebg_gamification` uses `user_level` NOT `level` (reserved keyword issue) |
| `assigned_at` column | `psk_ebg_assessment_tasks` uses `assigned_at` NOT `created_at` |
| `submitted_at` column | `psk_ebg_test_submissions` uses `submitted_at` NOT `created_at` |
| Stored procedures | `SP_CREATE_USER` handles user creation and gamification init. Called via `executeProcedure()` in `config.ts` |
| Connection pool | Initialized once at app start via `initPool()` in `src/lib/database/config.ts`. Pool alias: default |

---

## 7. AI & Innovation Roadmap (Clinical + Engagement)

### 7.1 Best-Case Product Scenario (for clinics/hospitals)

If architecture migration finishes successfully, the best-case operating model is:

1. **One unified care platform** for web + mobile, backed by a single NestJS API.
2. **Role-safe workflows** (patient, therapist, institution admin) with full auditability.
3. **Daily engagement loops** driven by adaptive reminders, micro-tasks, and quick check-ins.
4. **Clinician productivity boost** with AI-generated pre-session summaries and trend highlights.
5. **Measurable outcomes** (adherence, symptom trend, task completion, visit continuity) visible to institutions.

### 7.2 AI Agent Opportunities (practical, high impact)

#### A) Patient Engagement Agent

- Purpose: increase adherence to mood/journal/tasks/tests.
- Inputs: past completion patterns, preferred time windows, response latency.
- Actions: adaptive nudges (message tone, frequency, timing).
- KPI: weekly active users, task completion rate, streak continuity.

#### B) Session Prep Agent (Therapist Copilot)

- Purpose: reduce therapist prep time.
- Inputs: recent moods, journal summaries, tests, pending tasks, appointments.
- Output: 60-second pre-session brief + suggested agenda bullets.
- KPI: therapist prep time, session quality feedback, intervention timeliness.

#### C) Risk Triage Agent (Human-in-the-loop)

- Purpose: surface elevated-risk patterns earlier.
- Inputs: mood drops, concerning text signals, inactivity windows, high-risk test scores.
- Output: risk flags + escalation queue for therapist/admin review.
- Guardrail: **no autonomous diagnosis or treatment decision**.

#### D) Care Plan Agent

- Purpose: transform therapist goals into actionable weekly plans.
- Inputs: diagnosis context, therapy goals, patient constraints.
- Output: personalized micro-plan (2-5 tasks/week) with confidence scoring.
- KPI: plan adherence, dropout reduction, symptom trend improvements.

#### E) Institutional Insights Agent

- Purpose: provide anonymized operational intelligence.
- Inputs: aggregated usage/outcomes by clinic/team/program.
- Output: cohort trends, bottleneck alerts, intervention effectiveness signals.
- KPI: retention by cohort, no-show reduction, task completion by unit.

### 7.3 Safety, Compliance, and Clinical Guardrails

Mandatory for all AI agent features:

1. **Human oversight required** for high-risk recommendations.
2. **Explainable outputs**: each recommendation includes rationale and source signals.
3. **Role-based visibility**: patient data scoped strictly by ownership and role.
4. **Audit logs** for all AI-generated recommendations and user actions.
5. **Data minimization** for prompts; avoid exposing unnecessary PHI.

### 7.4 Lean Rollout Plan (recommended)

Phase A (fastest value):

- Session Prep Agent
- Patient Engagement Agent (simple rule + feedback loop)

Phase B:

- Risk Triage Agent with explicit therapist review queue
- Care Plan Agent draft generation

Phase C:

- Institutional Insights dashboards
- Cross-clinic benchmark analytics

### 7.5 Architecture Hooks for AI Agents

To keep AI features maintainable, add these modules in NestJS when ready:

```
apps/api/src/ai/
  ai.module.ts
  agents/
    engagement.agent.ts
    session-prep.agent.ts
    risk-triage.agent.ts
    care-plan.agent.ts
  services/
    ai-orchestrator.service.ts
    ai-policy.service.ts
  dto/
    ai-task.dto.ts
```

And keep agent outputs structured:

- `riskScore` (0-1)
- `confidence` (0-1)
- `recommendedActions[]`
- `explanations[]`
- `requiresHumanReview` (boolean)

This keeps AI decisions inspectable, testable, and safe for medical contexts.

---

## 8. Migration Completion Checklist (Lean Validation)

Use this as the final readiness gate before considering Phase 2/3 complete.

### 8.1 API Runtime

- [x] `npm run typecheck:api` passes
- [x] `npm run build:api` passes
- [x] `npm run start --workspace @psikotakip/api` runs cleanly on port `3001`
- [x] Protected route probe returns `401` when no token is sent (expected)

### 8.2 E2E Smoke Flow (Nest API)

- [x] Script exists: `scripts/smoke-api-e2e.js`
- [x] Command exists: `npm run smoke:api`
- [x] Therapist login works
- [x] Client login works
- [x] Profile fetch works
- [x] Therapist ↔ client connect/list works
- [x] Assessment task creation/list works
- [x] Test submission creation/list works
- [x] Mood/journal/gratitude create flows work

### 8.3 Web Integration

- [x] `NEXT_PUBLIC_API_URL` points to `http://localhost:3001`
- [x] `src/lib/api-client.ts` routes migrated prefixes to Nest API
- [x] Web app manual sanity pass completed (`login`, `dashboard`, `journey`, `tests`, `profile`)

### 8.4 Remaining Cleanup

- [ ] Remove any remaining local Next API routes no longer needed
- [ ] Keep only `/api/health` if still required for temporary local checks
- [ ] Update docs once final route retirement is done

### 8.5 Quick Runbook

```bash
npm run build:api
npm run start --workspace @psikotakip/api
npm run smoke:api
```

Smoke test env overrides (optional):

- `API_BASE_URL` (default: `http://localhost:3001`)
- `SMOKE_THERAPIST_EMAIL`
- `SMOKE_THERAPIST_PASSWORD`
- `SMOKE_CLIENT_EMAIL`
- `SMOKE_CLIENT_PASSWORD`
