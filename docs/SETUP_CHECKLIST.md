# Psikotakip Setup Checklist (Current Architecture)

Use this checklist for the **current** structure: Next.js Web + NestJS API + Oracle DB.

## 1) Prerequisites

- [ ] Node.js 20+
- [ ] npm installed
- [ ] Oracle DB reachable
- [ ] Oracle Instant Client configured for `oracledb`

## 2) Clone and Install

- [ ] Clone repository
  ```bash
  git clone https://github.com/curiousbrutus/psiko-takip.git
  cd psiko-takip-firebase
  ```
- [ ] Install dependencies
  ```bash
  npm install
  ```

## 3) Environment

- [ ] Create/update `.env` with Oracle + JWT + `NEXT_PUBLIC_API_URL`
- [ ] Ensure API URL is:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:3001
  ```

## 4) Database Setup

- [ ] Apply schema
  ```sql
  @database/schema.sql
  ```
- [ ] Apply procedures
  ```sql
  @database/procedures/user_management.sql
  @database/procedures/gamification.sql
  ```
- [ ] Verify `PSK_EBG_*` tables exist

## 5) API Validation

- [ ] Typecheck API
  ```bash
  npm run typecheck:api
  ```
- [ ] Build API
  ```bash
  npm run build:api
  ```
- [ ] Start API
  ```bash
  npm run start --workspace @psikotakip/api
  ```
- [ ] Verify protected route returns `401` without token
- [ ] Run smoke test
  ```bash
  npm run smoke:api
  ```

## 6) Web Validation

- [ ] Start web app
  ```bash
  npm run dev
  ```
- [ ] Open `http://localhost:9002`
- [ ] Manual sanity pass:
  - [ ] `/login`
  - [ ] `/dashboard`
  - [ ] `/dashboard/journey`
  - [ ] `/dashboard/tests`
  - [ ] `/dashboard/profile`

## 7) Optional Demo Data (Therapist Showcase)

- [ ] Seed full therapist/client showcase dataset
  ```bash
  npm run seed:demo
  ```
- [ ] Use deterministic demo emails when needed
  ```bash
  $env:DEMO_TAG='showcase'; npm run seed:demo
  ```
- [ ] Note default demo password is `Test123!` unless `DEMO_DEFAULT_PASSWORD` is set

## 8) Optional Test Users

- [ ] Seed legacy basic test users (if needed)
  ```bash
  node scripts/create-test-users.js
  ```

## 9) Ready Criteria

- [ ] API typecheck/build green
- [ ] `npm run smoke:api` green
- [ ] Web sanity pass complete
- [ ] No secrets committed
