# Psikotakip API Documentation (NestJS)

## Base URL

- Development: `http://localhost:3001`

> Most endpoints are protected and require `Authorization: Bearer <accessToken>`.

---

## Authentication

### `POST /auth/register`
Create user.

Body:
```json
{
  "email": "user@example.com",
  "password": "Test123!",
  "displayName": "John Doe",
  "role": "danisan"
}
```

### `POST /auth/login`
Login and receive tokens.

Body:
```json
{
  "email": "user@example.com",
  "password": "Test123!"
}
```

Response shape:
```json
{
  "user": {
    "userId": "USR_...",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "danisan",
    "status": "active",
    "connectedTherapistId": null,
    "phone": null
  },
  "accessToken": "...",
  "refreshToken": "..."
}
```

### `POST /auth/refresh`
Refresh token pair.

### `POST /auth/logout`
Logout (stateless success response).

### `GET /auth/me`
Get decoded JWT user payload (protected).

---

## Users

### `GET /users/profile`
### `PATCH /users/profile`
### `PATCH /users/password`

### Therapist routes
- `GET /users/clients`
- `POST /users/clients` (connect by email)
- `GET /users/clients/:clientId`
- `GET /users/search?q=...&role=...`

---

## Mood

- `POST /mood-entries`
- `GET /mood-entries`

---

## Journal

- `POST /journal-entries`
- `GET /journal-entries`

---

## Gratitude

- `POST /gratitude-entries`
- `GET /gratitude-entries`

---

## Gamification

- `GET /gamification`
- `PUT /gamification`
- `PUT /gamification/companion`

---

## Assessment

- `POST /assessment-tasks`
- `GET /assessment-tasks`
- `GET /assessment-tasks/:taskId`
- `POST /assessment-results`
- `GET /assessment-results`

---

## Test Submissions

- `POST /test-submissions`
- `GET /test-submissions`

---

## Collaborative Tasks

- `POST /collaborative-tasks`
- `GET /collaborative-tasks`
- `GET /collaborative-tasks/:taskId`
- `PUT /collaborative-tasks/:taskId`

---

## Appointments

- `POST /appointments`
- `GET /appointments`

---

## Error Format

Typical Nest error response:

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

Validation errors usually return `400` with `message` array.

---

## Smoke Test

Use:

```bash
npm run smoke:api
```

This validates login + key write/read flows against the live API on port `3001`.
