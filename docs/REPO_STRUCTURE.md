# Repository Structure (Lean)

This file documents the grouped layout after cleanup.

## Top-level

- `apps/` → runnable applications
- `packages/` → shared packages
- `src/` → Next.js web app
- `database/` → Oracle schema, procedures, scripts
- `scripts/` → utility scripts
- `docs/` → architecture + setup + product docs

## Grouped folders

### `database/scripts/`
Moved from root to keep SQL helpers together:
- `check_version.sql`
- `fix_gamification.sql`
- `setup_procedures.sql`
- `setup_schema.sql`
- `test_connection.sql`
- `verify_schema.sql`

### `scripts/db/`
- `test_db.js` (DB connectivity helper)

### `docs/product/`
- `MARKETING_COPY.md`
- `roadmap.md`

## Active core folders (do not treat as cleanup targets)

- `apps/api/src/` (Nest source)
- `packages/shared/src/` (shared contracts)
- `src/app/` (web routes/pages)
- `database/schema.sql` and `database/procedures/*`
