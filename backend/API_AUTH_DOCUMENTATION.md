# Google Authentication API Documentation

This document describes the authentication endpoints for VNotes, implementing OAuth 2.0 with Google and session token management.

## Overview

The authentication system uses:
- **Google OAuth 2.0** authorization code flow for user sign-up/login
- **JWT session tokens** (HS256, 24h expiration) for request authentication
- **Bearer token** format in Authorization headers
- **Rate limiting**: 5 attempts per IP per 5 minutes on `/auth/oauth`
- **CORS**: Configured for frontend origin with credential support

## Endpoints

### POST /auth/oauth

Exchange Google authorization code for session token.

**Request:**
```json
{
  "code": "4/0AX4XfWh..."  // Google authorization code from OAuth callback
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": "user_uuid_123",
    "email": "user@example.com",
    "name": "User Name",
    "profile_picture_url": "https://..."
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Missing code | Authorization code not provided or invalid type |
| 400 | Invalid code | Code has expired or is invalid |
| 401 | ID token invalid | Google ID token signature verification failed |
| 429 | Too Many Requests | Rate limit exceeded (5 per 5 min) |
| 500 | Server error | Database or internal error |

**Example:**
```bash
curl -X POST http://localhost:3001/auth/oauth \
  -H "Content-Type: application/json" \
  -d '{"code": "4/0AX4XfWh..."}'
```

---

### POST /auth/logout

Revoke current session token (logout).

**Request:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Malformed token | Authorization header format is invalid |
| 401 | Missing token | No Authorization header provided |
| 401 | Invalid token | Token signature verification failed |
| 500 | Server error | Session revocation failed |

**Example:**
```bash
curl -X POST http://localhost:3001/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### GET /api/user/profile

Retrieve authenticated user's profile.

**Request:**
```
Authorization: Bearer <session_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "user_id": "user_uuid_123",
    "email": "user@example.com",
    "name": "User Name",
    "profile_picture_url": "https://...",
    "created_at": "2024-01-15T10:30:00Z",
    "last_login_at": "2024-01-20T14:22:00Z"
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Malformed token | Authorization header format is invalid |
| 401 | Missing token | No Authorization header provided |
| 401 | Invalid token | Token signature verification failed |
| 401 | Token revoked | Token has been revoked |
| 500 | Server error | Database retrieval failed |

**Example:**
```bash
curl -X GET http://localhost:3001/api/user/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Protected Endpoints

The following endpoints require a valid session token in the Authorization header:

- `GET /api/recordings` - List user's recordings
- `GET /api/recordings/:id` - Get recording details
- `POST /api/recordings/upload` - Upload new recording
- `DELETE /api/recordings/:id` - Delete recording

**Authorization Header Format:**
```
Authorization: Bearer <session_token>
```

**Error Handling:**

All protected endpoints return:
- **400** - Malformed Bearer token (wrong format)
- **401** - Missing or invalid token
- **401** - Token expired or revoked
- **403** - Access denied (e.g., trying to access another user's recording)

---

## Session Token Format

JWT tokens include the following claims:

```json
{
  "sub": "google_oauth_id_123",      // Google user ID
  "user_id": "user_uuid_456",        // VNotes user ID
  "email": "user@example.com",       // User email
  "iat": 1705424400,                 // Issued at (Unix timestamp)
  "exp": 1705510800,                 // Expiration (24 hours later)
  "iss": "vnotes-backend"            // Issuer
}
```

**Token Expiration:** 24 hours (configurable via JWT_EXPIRATION env var)

---

## CORS Configuration

The API supports CORS with the following headers:

**Request:**
```
Origin: https://frontend.example.com
```

**Response Headers:**
```
Access-Control-Allow-Origin: https://frontend.example.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS
```

**Preflight (OPTIONS):**
All endpoints respond to preflight OPTIONS requests with proper CORS headers.

---

## Security Headers

All responses include security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Descriptive error message",
  "error": "ERROR_CODE",
  "timestamp": "2024-01-20T15:30:45Z"
}
```

**Note:** Error messages do not expose:
- Database connection details
- Internal file paths
- Sensitive credentials
- Secret keys

---

## Rate Limiting

Rate limiting is enforced on authentication endpoints:

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /auth/oauth | 5 attempts | 5 minutes per IP |
| POST /auth/logout | 10 attempts | 1 hour per IP |

**Rate Limit Headers:**
```
RateLimit-Limit: 5
RateLimit-Remaining: 3
RateLimit-Reset: 1705424700
```

When rate limit exceeded:
- **Status:** 429 Too Many Requests
- **Retry-After:** 300 (seconds)

---

## Environment Configuration

Required environment variables:

```bash
# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=your_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret
GOOGLE_OAUTH_CALLBACK_URI=https://yourdomain.com/api/auth/callback

# Session Management
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRATION=86400  # 24 hours in seconds

# CORS
CORS_ORIGIN=https://yourdomain.com

# Server
PORT=3001
NODE_ENV=production
```

---

## Development Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Google OAuth app credentials

### Installation

1. Clone repository and install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file with configuration (see Environment Configuration above)

3. Run migrations (if using Supabase):
```bash
npx supabase migration up
```

4. Start development server:
```bash
npm run dev
```

5. Run tests:
```bash
npm test          # Run all tests
npm run test:auth # Run auth tests only
```

---

## Deployment Checklist

Pre-deployment verification:

- [ ] JWT_SECRET is randomly generated (min 32 characters)
- [ ] GOOGLE_OAUTH_CLIENT_ID and CLIENT_SECRET are production credentials
- [ ] GOOGLE_OAUTH_CALLBACK_URI is HTTPS
- [ ] CORS_ORIGIN is production domain with HTTPS
- [ ] NODE_ENV is set to 'production'
- [ ] Database migrations applied to production
- [ ] All tests passing (npm test)
- [ ] HTTPS enabled on frontend and backend
- [ ] CORS headers verified with preflight requests

---

## Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm run test -- tests/authService.test.ts
npx vitest run tests/oauthService.test.ts
```

### Run Property-Based Tests
```bash
npx vitest run tests/property6-sessionRevocation.pbt.test.ts
npx vitest run tests/recordingOwnership.pbt.test.ts
```

### Integration Testing
```bash
# Start backend server
npm run dev

# In another terminal, run integration tests
npx vitest run tests/securityCheckpoint.pbt.test.ts
```

---

## Support & Troubleshooting

### Common Issues

**Rate limit exceeded (429)**
- Wait for the rate limit window to reset (5 min for oauth, 1 hour for logout)
- Check IP address if behind proxy

**Invalid token (401)**
- Token may be expired (refresh login after 24 hours)
- Token may be revoked (logout invalidates token)
- Token signature may be tampered (verify HTTP request integrity)

**CORS error**
- Verify frontend origin in CORS_ORIGIN env var
- Check browser console for actual allowed origin
- Ensure credentials mode enabled in fetch requests

**Database connection error (500)**
- Verify Supabase connection string
- Check database migrations were applied
- Verify user_profile and recording table schemas

---
