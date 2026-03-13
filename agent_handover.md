# Agent Handover

## Purpose

This file gives any new agent a fast, accurate snapshot of where this project currently stands, what was completed, and what to do next without re-discovering context.

## Current Stack

- Web: Next.js 15 App Router (root `src`)
- API: NestJS (`apps/api`)
- Database: Oracle (`PSK_EBG_*`)
- Shared contracts: `packages/shared`
- AI runtime (local-first): Ollama endpoints exposed from API (`/ai/*`)

## High-Value Completed Work

1. API module/import stabilization
   - Fixed TS module resolution around auth/users imports using barrel exports.

2. Repo cleanup and lean structure
   - Root clutter reduced.
   - SQL helpers moved to `database/scripts`.
   - DB helper moved to `scripts/db/test_db.js`.
   - Product docs grouped under `docs/product`.

3. Young Schema test implementation
   - Added short-form Young question bank and scoring flow.
   - Added route/page at `src/app/dashboard/tests/young-schema-scale/page.tsx`.
   - Added action handler and unit tests for question integrity.

4. Local Ollama integration in Nest API
   - Added `apps/api/src/ai` module with:
     - `GET /ai/health`
     - `GET /ai/models`
     - `POST /ai/generate`
   - Includes primary/fallback model behavior.

5. Therapist showcase demo seeding
   - Added `scripts/demo/seed-therapist-showcase.js`.
   - Added npm script `seed:demo`.
   - Fixed strict DTO validation issue by sending only register DTO fields.
   - Made seeding repeatable by auto-tagging emails (`DEMO_TAG`).

## Last Verified State

- `npm run build:api` succeeds.
- `npm run typecheck:api` succeeds.
- `npm run seed:demo` succeeds and prints generated credentials.
- API health checks were previously reachable on `http://localhost:3001`.

## Demo Seeding Behavior

- Command: `npm run seed:demo`
- Default password: `Test123!` (override with `DEMO_DEFAULT_PASSWORD`)
- Default email tag: auto-generated per run (e.g. `run400142`)
- Deterministic tag example (PowerShell):
  - `$env:DEMO_TAG='showcase'; npm run seed:demo`

## Most Recent Demo Output Pattern

- Admin: `admin.demo.<tag>@psikotakip.com`
- Therapists:
  - `ayse.terapist.demo.<tag>@psikotakip.com`
  - `murat.terapist.demo.<tag>@psikotakip.com`
  - `elif.terapist.demo.<tag>@psikotakip.com`
- Clients:
  - `deniz.danisan.demo.<tag>@psikotakip.com`
  - `zeynep.danisan.demo.<tag>@psikotakip.com`
  - `arda.danisan.demo.<tag>@psikotakip.com`
  - `selin.danisan.demo.<tag>@psikotakip.com`
  - `onur.danisan.demo.<tag>@psikotakip.com`
  - `ece.danisan.demo.<tag>@psikotakip.com`
  - `baris.danisan.demo.<tag>@psikotakip.com`
  - `melis.danisan.demo.<tag>@psikotakip.com`

## Known Operational Notes

1. API start command has intermittently exited with code 1 in some terminals.
   - Build/typecheck still pass.
   - There were times where port `3001` was already occupied by a previous process.

2. If API start fails again:
   - Ensure port 3001 is free.
   - Re-run `npm run build:api`.
   - Start API with `npm run start --workspace @psikotakip/api`.
   - If still failing, capture full startup stack trace from terminal output.

3. Ollama CLI (`ollama list`) failed in at least one terminal session.
   - API `/ai/health` endpoint should be used to verify runtime integration status from app side.

## Immediate Next Best Tasks

1. Stabilize API launch ergonomics
   - Add a single script that ensures port cleanup then starts API reliably.

2. Strengthen demo script idempotency further
   - Optional: support a `--dry-run` mode and a concise summary report JSON.

3. Therapist demo polish
   - Build a single “Demo Playbook” doc with exact login order and scenario narrative.

## Quick Command Reference

- Install: `npm install`
- API typecheck: `npm run typecheck:api`
- API build: `npm run build:api`
- API start: `npm run start --workspace @psikotakip/api`
- Web start: `npm run dev`
- API smoke: `npm run smoke:api`
- Demo seed: `npm run seed:demo`

## Key Files to Read First (for any new agent)

- `README.md`
- `ARCHITECTURE_PLAN.md`
- `TECHNICAL_DOCUMENTATION.md`
- `docs/API_DOCUMENTATION.md`
- `docs/SETUP_CHECKLIST.md`
- `scripts/demo/seed-therapist-showcase.js`
- `apps/api/src/ai/ai.service.ts`
- `src/app/dashboard/tests/young-schema-scale/page.tsx`