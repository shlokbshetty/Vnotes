# VNotes REST API Reference

This document specifies all HTTP endpoints, authentication schemes, rate limits, request parameters, JSON payloads, and error structures exposed by the **VNotes Backend API** (`backend/src/server.ts`).

---

## 1. Base URLs & Environments

| Environment | Base URL | Frontend Origin (`CORS`) |
| :--- | :--- | :--- |
| **Local Development** | `http://localhost:3001` | `http://localhost:3000` |
| **Docker Compose** | `http://localhost:3001` | `http://localhost:3000` |

---

## 2. Authentication Scheme

Protected endpoints require an **HS256 JSON Web Token (JWT)** issued by `POST /auth/oauth` and passed in the HTTP `Authorization` header:

```http
Authorization: Bearer <sessionToken>
```

### JWT Claims Structure (`JWTPayload`)
```json
{
  "user_id": "109876543210987654321",
  "email": "alex@example.com",
  "iat": 1730000000,
  "exp": 1730086400,
  "iss": "vnotes-backend",
  "jti": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
}
```

### Authentication Middleware Checks (`authMiddleware.ts`)
1. Verifies presence of `Authorization` header (`401 MISSING_AUTH_HEADER` if absent).
2. Verifies `Bearer <token>` format (`401 MALFORMED_AUTH_HEADER` if invalid).
3. Checks `sessionStore.isTokenRevoked(token)` (`401 TOKEN_REVOKED` if logged out).
4. Verifies HS256 cryptographic signature, `iss === 'vnotes-backend'`, and `exp` via `verifyJWT(token)`.
5. Checks `sessionStore.isTokenRevoked(token, payload.jti)` for JTI-level revocation.
6. Attaches `req.user`, `req.userId`, `req.userEmail`, and `req.token` to the Express `Request`.

---

## 3. Rate Limiting

| Limiter | Applied Route | Window | Max Requests / IP | Exceeded Response (`429`) |
| :--- | :--- | :--- | :---: | :--- |
| `oauthLimiter` | `POST /auth/oauth` | 5 minutes (`300s`) | `5` | `{ "success": false, "error": "Too many authentication attempts...", "code": "RATE_LIMIT_EXCEEDED", "retryAfter": 300 }` |
| `logoutLimiter` | `POST /auth/logout` | 1 hour (`3600s`) | `10` | `{ "success": false, "error": "Too many logout requests...", "code": "RATE_LIMIT_EXCEEDED", "retryAfter": 3600 }` |

---

## 4. Endpoint Summary

| Method | Path | Auth Required | Description |
| :---: | :--- | :---: | :--- |
| `GET` | `/` | No | Root service metadata and running status |
| `GET` | `/health` | No | Liveness health check with ISO timestamp |
| `GET` | `/uploads/:filename` | No | Static media stream for uploaded audio/video files |
| `POST` | `/auth/oauth` | No (Rate Limited) | Exchange Google OAuth 2.0 authorization code for VNotes session JWT |
| `POST` | `/auth/logout` | **Yes** (Rate Limited) | Revoke current session JWT and `jti` in `sessionStore` |
| `GET` | `/api/user/profile` | **Yes** | Retrieve authenticated user profile claims |
| `GET` | `/api/pricing` | No | Retrieve subscription pricing tiers and feature comparison matrix |
| `POST` | `/api/recordings/upload` | **Yes** | Upload audio/video file (`multipart/form-data`, max 500 MB) |
| `GET` | `/api/recordings` | **Yes** | List authenticated user's recordings (supports `?q=` full-text search) |
| `GET` | `/api/recordings/:id` | **Yes** | Retrieve single recording metadata by ID (enforces ownership) |
| `DELETE` | `/api/recordings/:id` | **Yes** | Delete recording file from disk and metadata store (enforces ownership) |
| `POST` | `/api/recordings/:id/key-moments` | **Yes** | Add a timestamped key moment bookmark to a recording |
| `DELETE` | `/api/recordings/:id/key-moments` | **Yes** | Remove a timestamped key moment bookmark from a recording |
| `POST` | `/api/recordings/:id/transcribe` | **Yes** | Transcribe recording audio via ElevenLabs Scribe v2 (`scribe_v2`) |
| `POST` | `/api/recordings/:id/summary` | **Yes** | Generate executive summary, key points, and action items from transcript |

---

## 5. Detailed Endpoint Specifications

### 5.1 System & Health Endpoints

#### `GET /`
Returns API banner and version.

**Response (`200 OK`)**:
```json
{
  "message": "VNotes Backend API",
  "version": "1.0.0",
  "status": "running"
}
```

#### `GET /health`
Returns service health check status.

**Response (`200 OK`)**:
```json
{
  "status": "ok",
  "timestamp": "2026-10-28T17:20:00.000Z"
}
```

---

### 5.2 Authentication Endpoints

#### `POST /auth/oauth`
Exchanges a Google OAuth 2.0 authorization code for Google OIDC tokens, verifies the ID token against Google JWKS, and issues a signed VNotes HS256 JWT.

**Request Body (`application/json`)**:
```json
{
  "code": "4/0AVG7fiQ_example_google_oauth_code"
}
```

**Success Response (`200 OK`)**:
```json
{
  "success": true,
  "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": "109876543210987654321",
    "email": "alex@example.com",
    "name": "Alex Rivera",
    "profile_picture_url": "https://lh3.googleusercontent.com/a/default-user"
  },
  "expiresIn": 86400
}
```

**Error Responses**:
- `400 Bad Request` (`MISSING_AUTH_CODE`): `{ "success": false, "error": "Authorization code is required", "code": "MISSING_AUTH_CODE" }`
- `400 Bad Request` (`INVALID_GRANT`): Invalid or expired Google authorization code.
- `401 Unauthorized`: Google ID token verification failed (audience, issuer, or signature mismatch).
- `429 Too Many Requests` (`RATE_LIMIT_EXCEEDED`): Exceeded 5 attempts per 5 minutes.

---

#### `POST /auth/logout`
Revokes the caller's active Bearer JWT and its `jti` identifier in `sessionStore`.

**Headers**: `Authorization: Bearer <sessionToken>`

**Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### `GET /api/user/profile`
Returns the authenticated user's profile derived from their verified JWT claims.

**Headers**: `Authorization: Bearer <sessionToken>`

**Success Response (`200 OK`)**:
```json
{
  "success": true,
  "user": {
    "user_id": "109876543210987654321",
    "email": "alex@example.com",
    "name": null,
    "profile_picture_url": null,
    "account_created_timestamp": null,
    "last_login_timestamp": null
  }
}
```

---

### 5.3 Pricing Endpoint

#### `GET /api/pricing`
Returns the structured subscription tiers (`free`, `pro`) and feature comparison matrix from `backend/src/data/pricing.json`.

**Success Response (`200 OK`)**:
```json
{
  "tiers": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "billingPeriod": "month",
      "description": "Essential tools for individuals getting started with voice notes",
      "features": [
        "Up to 10 recordings per month",
        "Basic audio recording and playback",
        "Up to 30 minutes per recording",
        "Standard transcription accuracy",
        "7-day recording history",
        "Web access only"
      ],
      "ctaText": "Get Started",
      "ctaAction": "/recordings",
      "isPopular": false
    },
    {
      "id": "pro",
      "name": "Professional",
      "price": 19,
      "billingPeriod": "month",
      "description": "Unlimited recording and AI features for power users and professionals",
      "features": [
        "Unlimited recordings",
        "HD audio and video recording",
        "Unlimited recording length",
        "AI-powered transcription (99% accuracy)",
        "AI-generated summaries and key points",
        "Action items extraction",
        "Key moments tagging",
        "Full-text search across all recordings",
        "Unlimited recording history",
        "Priority processing",
        "Export to multiple formats (PDF, TXT, DOCX)"
      ],
      "ctaText": "Start Free Trial",
      "ctaAction": "/recordings",
      "isPopular": true
    }
  ],
  "comparison": {
    "features": [
      { "name": "Monthly Recordings", "category": "Recording Limits" },
      { "name": "AI Summaries & Key Points", "category": "AI Features" }
    ],
    "tiers": {
      "free": ["Up to 10", false],
      "pro": ["Unlimited", true]
    }
  }
}
```

---

### 5.4 Recordings & AI Processing Endpoints

#### `POST /api/recordings/upload`
Uploads a single audio or video file up to **500 MB** and creates a metadata entry scoped to `req.userId`.

- **Headers**: `Authorization: Bearer <sessionToken>`
- **Content-Type**: `multipart/form-data`
- **Form Field**: `file`
- **Allowed Audio MIME Types**: `audio/wav`, `audio/mpeg`, `audio/mp3`, `audio/m4a`, `audio/aac`, `audio/flac`
- **Allowed Video MIME Types**: `video/mp4`, `video/x-matroska`, `video/mkv`, `video/webm`, `video/avi`, `video/quicktime`

**Success Response (`201 Created`)**:
```json
{
  "success": true,
  "data": {
    "id": "1730001234567-abc123def",
    "filename": "1730001234560-987654321.mp3",
    "originalName": "product-sync.mp3",
    "filePath": "/uploads/1730001234560-987654321.mp3",
    "fileSize": 4821904,
    "mimeType": "audio/mpeg",
    "type": "audio",
    "createdAt": "2026-10-28T17:25:00.000Z",
    "user_id": "109876543210987654321"
  }
}
```

---

#### `GET /api/recordings`
Lists all recordings belonging to the authenticated user. Supports optional case-insensitive full-text search across `originalName`, `transcription`, and `summary`.

- **Headers**: `Authorization: Bearer <sessionToken>`
- **Query Parameters**:
  - `q` *(optional, string)*: Search filter query (e.g., `/api/recordings?q=roadmap`)

**Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1730001234567-abc123def",
      "filename": "1730001234560-987654321.mp3",
      "originalName": "product-sync.mp3",
      "filePath": "/uploads/1730001234560-987654321.mp3",
      "fileSize": 4821904,
      "mimeType": "audio/mpeg",
      "type": "audio",
      "createdAt": "2026-10-28T17:25:00.000Z",
      "user_id": "109876543210987654321",
      "transcription": "Welcome to the Q4 product roadmap review...",
      "summary": "Welcome to the Q4 product roadmap review.",
      "keyPoints": ["We decided to prioritize real-time collaboration."],
      "actionItems": ["Alex will finalize the API schema by Friday."],
      "keyMoments": [
        { "time": "02:15", "label": "Architecture Decision" }
      ]
    }
  ]
}
```

---

#### `GET /api/recordings/:id`
Retrieves a single recording by ID. Enforces tenant isolation (`recording.user_id === req.userId`).

- **Headers**: `Authorization: Bearer <sessionToken>`
- **Responses**:
  - `200 OK`: `{ "success": true, "data": { ...Recording } }`
  - `403 Forbidden`: `{ "success": false, "error": "Access denied", "code": "FORBIDDEN" }`
  - `404 Not Found`: `{ "success": false, "error": "Recording not found" }`

---

#### `DELETE /api/recordings/:id`
Deletes both the physical media file in `backend/uploads/` and its metadata entry in `recordings.json`. Enforces tenant ownership (`403 FORBIDDEN` if `recording.user_id !== req.userId`).

**Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "message": "Recording deleted successfully"
  }
}
```

---

#### `POST /api/recordings/:id/key-moments`
Adds a timestamped bookmark to the recording's `keyMoments` array.

**Request Body (`application/json`)**:
```json
{
  "time": "04:32",
  "label": "Q4 Budget Approval"
}
```

**Success Response (`200 OK`)**: Returns `{ "success": true, "data": { ...Recording } }` with updated `keyMoments`.

---

#### `DELETE /api/recordings/:id/key-moments`
Removes a timestamped bookmark matching `time` from the recording's `keyMoments` array.

**Request Body (`application/json`)**:
```json
{
  "time": "04:32"
}
```

**Success Response (`200 OK`)**: Returns `{ "success": true, "data": { ...Recording } }` with the matching key moment removed.

---

#### `POST /api/recordings/:id/transcribe`
Streams the recording's media file to the ElevenLabs Speech-to-Text API (`model_id: 'scribe_v2'`) and saves the resulting text to `recording.transcription`.

- **Headers**: `Authorization: Bearer <sessionToken>`
- **Success Response (`200 OK`)**: Returns `{ "success": true, "data": { ...Recording } }` with `transcription` populated.
- **Error Responses**: `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 NOT_FOUND`, `500 TRANSCRIPTION_ERROR`.

---

#### `POST /api/recordings/:id/summary`
Analyzes `recording.transcription` to generate `summary`, `keyPoints`, and `actionItems`.

- **Headers**: `Authorization: Bearer <sessionToken>`
- **Success Response (`200 OK`)**: Returns `{ "success": true, "data": { ...Recording } }` with `summary`, `keyPoints`, and `actionItems` populated.
- **Error Responses**:
  - `400 Bad Request` (`NO_TRANSCRIPTION`): `{ "success": false, "error": "Recording must be transcribed before generating summary" }`
  - `403 Forbidden` (`FORBIDDEN`): Caller does not own the recording.
  - `404 Not Found`: Recording ID does not exist.

---

## 6. Standardized Error Codes Reference

| Error Code | HTTP Status | Trigger Condition |
| :--- | :---: | :--- |
| `MISSING_AUTH_CODE` | `400` | `POST /auth/oauth` called without a non-empty `code` string |
| `INVALID_GRANT` | `400` | Google OAuth rejected the authorization code (expired, malformed, or already used) |
| `UPLOAD_ERROR` | `400` | `POST /api/recordings/upload` called without a `file` field or unsupported MIME type |
| `INVALID_INPUT` | `400` | Missing `time` or `label` when adding/removing key moments |
| `NO_TRANSCRIPTION` | `400` | `POST /api/recordings/:id/summary` called before transcribing the recording |
| `MISSING_AUTH_HEADER` | `401` | Protected route called without an `Authorization` header |
| `MALFORMED_AUTH_HEADER` | `401` | `Authorization` header does not follow `Bearer <token>` syntax |
| `TOKEN_REVOKED` | `401` | Session token or `jti` was invalidated via `POST /auth/logout` |
| `JWT_EXPIRED` | `401` | Session JWT `exp` timestamp has passed |
| `JWT_INVALID_SIGNATURE` | `401` | Session JWT signature failed HS256 verification |
| `FORBIDDEN` | `403` | Authenticated user attempted to read, mutate, or delete another user's recording |
| `NOT_FOUND` | `404` | Requested route or recording ID does not exist |
| `RATE_LIMIT_EXCEEDED` | `429` | IP exceeded `oauthLimiter` (5/5m) or `logoutLimiter` (10/1h) |
| `TRANSCRIPTION_ERROR` | `500` | ElevenLabs API error or missing physical file on disk |
| `SUMMARY_ERROR` | `500` | Unexpected failure during NLP summary generation |
