# Psikotakip Technical Documentation (Current)

## 1. System Purpose

Psikotakip is a role-based mental health operations platform for:
- Clients (`danisan`)
- Therapists (`terapist`)
- Institution admins (`kurum_yoneticisi`)

It focuses on adherence, structured tracking, and therapist productivity through a single API backbone.

---

## 2. Architecture

### Web
- Next.js 15 app (root `src`)
- Port: `9002`
- Calls API through `src/lib/api-client.ts`

### API
- NestJS app (`apps/api`)
- Port: `3001`
- Modules: auth, users, mood, journal, gratitude, gamification, appointments, assessment, collaborative tasks, tests

### Shared Contracts
- `packages/shared`
- Shared TS types/constants between apps

### Database
- Oracle (`oracledb`)
- Tables use `PSK_EBG_` prefix
- Stored procedures in `database/procedures`

### AI
- Genkit + Gemini flows in web app (`src/ai`)
- Kept isolated from core business logic

---

## 3. Authentication and Authorization

- JWT access + refresh token model
- Nest `JwtAuthGuard` protects endpoints
- Role information included in token payload
- User statuses enforced (`active`, `inactive`, `suspended`)

---

## 4. Main Data Domains

- Users/Profile/Therapist-client linking
- Mood entries
- Journal entries
- Gratitude entries
- Gamification + companion
- Assessment tasks/results
- Collaborative tasks
- Appointments
- Test submissions

---

## 5. Runtime and Validation

### Required env keys
- `ORACLE_USER`
- `ORACLE_PASSWORD`
- `ORACLE_CONNECTION_STRING`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `NEXT_PUBLIC_API_URL`

### Validation workflow
1. `npm run typecheck:api`
2. `npm run build:api`
3. Start API (`npm run start --workspace @psikotakip/api`)
4. `npm run smoke:api`
5. Start web and run manual route sanity checks

---

## 6. Notes and Guardrails

- Keep Oracle aliases explicit (double-quoted camelCase aliases) to avoid uppercase mapping issues.
- Keep table names with `PSK_EBG_` prefix.
- Keep CLOBs serialized as strings in API DB layer (`oracledb.fetchAsString = [oracledb.CLOB]`).
- Avoid reintroducing duplicated Next API routes for migrated domains.

---

## 7. Repository Layout (Relevant)

```text
apps/
  api/
packages/
  shared/
src/
  app/
  lib/
  ai/
database/
docs/
scripts/
```
