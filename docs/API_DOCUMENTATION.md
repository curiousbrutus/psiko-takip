# Psikotakip - API Documentation

## Base URL

Development: `http://localhost:9002/api`
Production: `https://your-domain.com/api`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "displayName": "John Doe",
  "role": "danisan"  // or "terapist" or "kurum_yoneticisi"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "userId": "USR_1234567890_5678",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "danisan"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "userId": "USR_1234567890_5678",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "danisan",
    "connectedTherapistId": "USR_0987654321_4321"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Başarıyla çıkış yapıldı"
}
```

### User Management

#### Get User Profile
```http
GET /api/users/me
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "userId": "USR_1234567890_5678",
  "email": "user@example.com",
  "displayName": "John Doe",
  "role": "danisan",
  "phone": "+90 555 123 4567",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastLogin": "2024-01-15T12:30:00.000Z",
  "connectedTherapistId": "USR_0987654321_4321"
}
```

#### Update User Profile
```http
PATCH /api/users/me
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "displayName": "Jane Doe",
  "phone": "+90 555 987 6543"
}
```

#### Change Password
```http
POST /api/users/me/password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

#### Get User Statistics
```http
GET /api/users/me/stats
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "totalMoods": 45,
  "totalJournals": 30,
  "totalTests": 12,
  "totalAppointments": 8,
  "totalXp": 2500,
  "currentLevel": 26,
  "currentStreak": 7
}
```

### Therapist Endpoints

#### Get Therapist's Clients
```http
GET /api/users/clients
Authorization: Bearer <therapist_access_token>
```

**Response (200):**
```json
{
  "clients": [
    {
      "userId": "USR_1234567890_5678",
      "email": "client@example.com",
      "displayName": "Client Name",
      "status": "active",
      "level": 5,
      "currentStreak": 3,
      "xp": 450
    }
  ]
}
```

#### Connect Client to Therapist
```http
POST /api/users/connect-therapist
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "clientId": "USR_1234567890_5678",
  "therapistId": "USR_0987654321_4321"
}
```

### Gamification

#### Get Gamification Data
```http
GET /api/gamification/me
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "userId": "USR_1234567890_5678",
  "xp": 2500,
  "level": 26,
  "currentStreak": 7,
  "longestStreak": 15,
  "companionType": "filiz",
  "companionCreatedAt": "2024-01-01T00:00:00.000Z",
  "lastActivityDate": "2024-01-15T12:00:00.000Z",
  "totalTasksCompleted": 125,
  "xpToNextLevel": 100
}
```

#### Add XP
```http
POST /api/gamification/add-xp
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "xpAmount": 50,
  "activityType": "journal_entry"
}
```

#### Set Companion
```http
POST /api/gamification/companion
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "companionType": "filiz"  // or "toz"
}
```

### Mood Tracking

#### Create Mood Entry
```http
POST /api/moods
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "mood": "mutlu",
  "period": "morning",
  "intensity": 4,
  "notes": "Güzel bir sabah"
}
```

#### Get Mood Entries
```http
GET /api/moods?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <access_token>
```

### Journal Entries

#### Create Journal Entry
```http
POST /api/journals
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "content": "Bugün çok güzel bir gündü...",
  "prompt": "Bugün seni mutlu eden neydi?",
  "entryType": "gratitude",
  "isShared": true
}
```

#### Get Journal Entries
```http
GET /api/journals?limit=20&offset=0
Authorization: Bearer <access_token>
```

#### Get Shared Journals (Therapist)
```http
GET /api/journals/client/:clientId
Authorization: Bearer <therapist_access_token>
```

### Tests & Assessments

#### Submit Test
```http
POST /api/tests/submit
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "testName": "Beck Depression Inventory",
  "answers": [
    {"questionId": 1, "answer": 2},
    {"questionId": 2, "answer": 1}
  ],
  "totalScore": 15
}
```

#### Get Test Results
```http
GET /api/tests/results
Authorization: Bearer <access_token>
```

#### Assign Assessment (Therapist)
```http
POST /api/assessments/assign
Authorization: Bearer <therapist_access_token>
Content-Type: application/json

{
  "clientId": "USR_1234567890_5678",
  "testName": "GAD-7",
  "dueDate": "2024-02-01T00:00:00.000Z",
  "notes": "Lütfen bu haftaya kadar tamamlayın"
}
```

### Appointments

#### Create Appointment (Therapist)
```http
POST /api/appointments
Authorization: Bearer <therapist_access_token>
Content-Type: application/json

{
  "clientId": "USR_1234567890_5678",
  "appointmentDate": "2024-02-01T14:00:00.000Z",
  "appointmentType": "Online",
  "durationMinutes": 50,
  "description": "Haftalık seans"
}
```

#### Get Appointments
```http
GET /api/appointments?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <access_token>
```

### Chat (Therapeutic Assistant)

#### Send Chat Message
```http
POST /api/chat
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "message": "Bugün kendimi çok stresli hissediyorum",
  "context": {
    "recentMood": "stresli",
    "lastTestScore": 15
  }
}
```

**Response (200):**
```json
{
  "messageId": "MSG_1234567890_5678",
  "response": "Stresli hissettiğinizi duydum...",
  "isCrisis": false
}
```

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message in Turkish"
}
```

### Common HTTP Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

## Rate Limiting

API requests are rate-limited to prevent abuse:

- Authenticated endpoints: 100 requests per 15 minutes
- Public endpoints: 20 requests per 15 minutes

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

## Pagination

List endpoints support pagination:

```http
GET /api/journals?limit=20&offset=0
```

Parameters:
- `limit` - Number of items per page (default: 20, max: 100)
- `offset` - Number of items to skip (default: 0)

Response includes pagination info:
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

## Filtering & Sorting

Many endpoints support filtering and sorting:

```http
GET /api/moods?startDate=2024-01-01&endDate=2024-01-31&period=morning&sort=createdAt&order=desc
```

## CORS

CORS is enabled for configured origins. Include credentials in requests:

```javascript
fetch('http://localhost:9002/api/users/me', {
  credentials: 'include',
  headers: {
    'Authorization': 'Bearer ' + accessToken
  }
});
```

## WebSocket Support (Future)

Real-time features will be available via WebSocket:

```javascript
const ws = new WebSocket('ws://localhost:9002/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle real-time updates
};
```

## SDKs & Client Libraries

Official client libraries:

- JavaScript/TypeScript: `@psikotakip/client-js`
- React Hooks: `@psikotakip/react-hooks`

## Testing

### API Testing with cURL

```bash
# Register
curl -X POST http://localhost:9002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","displayName":"Test User","role":"danisan"}'

# Login
curl -X POST http://localhost:9002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Get Profile
curl -X GET http://localhost:9002/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Postman Collection

Import the Postman collection from `/docs/postman/psikotakip-api.json`

## Support

For API support:
- Email: api-support@psikotakip.com
- Documentation: https://docs.psikotakip.com
- GitHub Issues: https://github.com/curiousbrutus/psiko-takip-firebase/issues
