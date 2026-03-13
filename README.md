# Psikotakip

> New agent onboarding: read `agent_handover.md` first.

Psikotakip is a mental health tracking platform for three roles:
- `danisan` (client/patient)
- `terapist` (therapist)
- `kurum_yoneticisi` (institution admin)

The project now uses a lean monorepo architecture:
- **Web app**: Next.js (UI + AI flows)
- **API**: NestJS (`apps/api`) with Oracle database
- **Shared contracts**: `packages/shared`

---

## Current Architecture

- `apps/api`: NestJS REST API on `http://localhost:3001`
- `src` (root): Next.js web app on `http://localhost:9002`
- `packages/shared`: shared TypeScript types/constants used across apps
- `database`: Oracle schema/procedure scripts (`PSK_EBG_*` tables)

The web app calls migrated backend endpoints through `NEXT_PUBLIC_API_URL`.

---

## Features

- JWT auth (access + refresh)
- Role-based workflows (client/therapist/admin)
- Mood, journal, gratitude tracking
- Assessment task assignment and results
- Test submissions and therapist review
- Collaborative tasks and appointments
- Gamification (XP, streak, companion)
- AI support flows via Genkit/Gemini

---

## Prerequisites

- Node.js `20+`
- npm `10+`
- Oracle Database (12c/19c/21c)
- Oracle Instant Client (for `oracledb`)

---

## Quick Start

### 1) Clone

```bash
git clone https://github.com/curiousbrutus/psiko-takip.git
cd psiko-takip-firebase
```

### 2) Install dependencies

```bash
npm install
```

### 3) Configure environment

Create/update `.env` at repo root (and optionally `apps/api/.env`):

```env
# Oracle
ORACLE_USER=FTH
ORACLE_PASSWORD=YOUR_PASSWORD
ORACLE_CONNECTION_STRING=BYZDB
ORACLE_POOL_MIN=2
ORACLE_POOL_MAX=10

# JWT
JWT_SECRET=psikotakip-jwt-secret-key-2024-local
JWT_REFRESH_SECRET=psikotakip-refresh-secret-key-2024-local
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# API routing for web
NEXT_PUBLIC_API_URL=http://localhost:3001

# Optional AI
GOOGLE_GENAI_API_KEY=YOUR_KEY
```

### 4) Initialize database

Run the SQL scripts in Oracle SQL*Plus (or compatible client):

```sql
@database/schema.sql
@database/procedures/user_management.sql
@database/procedures/gamification.sql
```

### 5) Start API and Web

Terminal 1:
```bash
npm run build:api
npm run start --workspace @psikotakip/api
```

Terminal 2:
```bash
npm run dev
```

Open:
- Web: `http://localhost:9002`
- API: `http://localhost:3001`

---

## Development Commands

```bash
# Web
npm run dev
npm run build
npm run lint
npm run typecheck

# API
npm run dev:api
npm run build:api
npm run typecheck:api

# Shared package typecheck
npm run typecheck:shared

# API smoke test
npm run smoke:api
```

---

## Project Structure

```text
.
├─ apps/
│  └─ api/                    # NestJS API
├─ packages/
│  └─ shared/                 # Shared TS contracts
├─ src/                       # Next.js web app
├─ database/                  # Oracle schema/procedures
│  └─ scripts/                # DB maintenance/verification SQL
├─ docs/                      # Supporting docs
│  └─ product/                # Product/strategy notes
└─ scripts/                   # Utility scripts
	 └─ db/                     # Local DB connectivity helpers
```

### Lean regrouping (root cleanup)

- SQL helpers moved from root to `database/scripts/`:
	- `check_version.sql`
	- `fix_gamification.sql`
	- `setup_procedures.sql`
	- `setup_schema.sql`
	- `test_connection.sql`
	- `verify_schema.sql`
- DB JS helper moved to `scripts/db/test_db.js`
- Product notes moved to `docs/product/`

---

## Validation Flow (Recommended)

1. `npm run typecheck:api`
2. `npm run build:api`
3. Start API on `3001`
4. `npm run smoke:api`
5. Start web and do manual sanity pass (`/login`, `/dashboard`, `/dashboard/journey`, `/dashboard/tests`, `/dashboard/profile`)

---

## Demo Seed (Therapist Showcase)

Use the demo seeder to generate a complete therapist/client showcase dataset.

```bash
npm run seed:demo
```

- Default password for generated users: `Test123!`
- By default, emails are auto-tagged per run (for example `...run400142@...`) to avoid collisions.

Set `DEMO_TAG` when you want deterministic emails across runs:

```bash
$env:DEMO_TAG='showcase'; npm run seed:demo
```

Optional variables:
- `API_BASE_URL` (default: `http://localhost:3001`)
- `DEMO_DEFAULT_PASSWORD` (default: `Test123!`)

---

## Related Docs

- `ARCHITECTURE_PLAN.md`
- `docs/API_DOCUMENTATION.md`
- `docs/SETUP_CHECKLIST.md`
- `TECHNICAL_DOCUMENTATION.md`

---

## Notes

- API migration is active; legacy Next API routes were removed for migrated domains.
- Keep Oracle table names with `PSK_EBG_` prefix.
- Do not commit `.env` secrets.
