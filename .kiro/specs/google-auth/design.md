# Google Authentication Design Document

## Overview

This design document provides a comprehensive technical specification for implementing Google OAuth 2.0 authentication in VNotes. The system enables user sign-up, login, session management, and recording ownership tracking while maintaining security and scalability.

**Scope**: Frontend UI, backend API endpoints, authentication middleware, session management, and recording ownership enforcement.

**Out of Scope**: Supabase schema design, database implementation, and user profile persistence layer (handled by separate team).

**Key Decisions**:
- Authorization Code Flow for OAuth (server-side token exchange for security)
- JWT session tokens with 24-hour expiration (configurable)
- Middleware-based authentication for route protection
- Bearer token format in Authorization headers
- HTTPS-only for production deployments
- Session revocation list for immediate token invalidation

---

## Architecture

### System Components Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React/Vite)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Login Page  │  Signup UI  │  User Menu  │  Protected   │  │
│  │              │             │             │   Routes    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↕                                  │
│            OAuth Popup / Session Token Management              │
└─────────────────────────────────────────────────────────────────┘
                              ↕
                    HTTPS / CORS Validation
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│               Backend (Express/Node.js)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Authentication Middleware                        │  │
│  │    (Token Validation, User Extraction)                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↕                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Auth Routes     │ Recording Routes  │ User Routes      │  │
│  │  - /auth/oauth   │ - GET /api/..    │ - /api/user/..   │  │
│  │  - /auth/logout  │ - POST /api/..   │                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↕                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Services & Utilities                             │  │
│  │  - JWT Generation/Validation                             │  │
│  │  - Google Token Exchange                                 │  │
│  │  - Session Management                                    │  │
│  │  - Recording Ownership Checks                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
          ┌───────────────────────────────────┐
          │  Google OAuth 2.0 Endpoints       │
          │  - Authorization endpoint         │
          │  - Token endpoint                 │
          │  - JWKS endpoint (public keys)    │
          └───────────────────────────────────┘
                              ↕
          ┌───────────────────────────────────┐
          │  Supabase (Separate Team)         │
          │  - User Profiles                  │
          │  - Recording Metadata             │
          │  - Session Store (optional)       │
          │  - RLS Policies                   │
          └───────────────────────────────────┘
```

### Data Flow: OAuth Sign Up / Login

```
User Browser                Backend                   Google
    │                          │                        │
    ├─ Click Google Auth ──────→│                        │
    │                          │                        │
    │  ← Redirect to Google ────│← Verify Redirect URI  │
    │                          │                        │
    ├─ Authenticate on Google ─────────────────────────→│
    │                          │                        │
    │                          │← Auth Code (via user) ┤
    │                          │                        │
    │ ← Redirect to Callback ──│                        │
    │ (with auth code)         │                        │
    │                          │                        │
    ├─ Send Auth Code ────────→│                        │
    │                          │                        │
    │                          ├─ Exchange Code ──────→│
    │                          │← ID Token, Access Token
    │                          │                        │
    │                          ├─ Verify Signature ────→│
    │                          │← Public Keys (JWKS)  │
    │                          │                        │
    │                          ├─ Extract Claims ──────→│
    │                          │   (email, name, sub)  │
    │                          │                        │
    │                          ├─ Create/Update Profile
    │                          │   in Supabase
    │                          │
    │ ← Session Token ─────────│
    │   (JWT)                  │
    │
    ├─ Store in localStorage ──→│
    │
    └─ Subsequent requests with
      Authorization header

```

### Authentication Flow States

**State 1: Unauthenticated**
- User sees login page
- No session token stored
- API requests return 401 Unauthorized

**State 2: OAuth Authorization**
- Google popup/redirect active
- User authenticates with Google
- Backend receives authorization code

**State 3: Token Exchange**
- Backend exchanges code for tokens
- ID token verified against Google's public keys
- User profile created/updated in Supabase

**State 4: Authenticated**
- Session JWT generated
- User stored in frontend state
- Bearer token included in API requests
- User menu displayed with profile info

**State 5: Token Refresh** (Future Enhancement)
- Session token expires (24 hours)
- Frontend detects 401 response
- User redirected to login or refresh triggered

**State 6: Logged Out**
- Session token invalidated/revoked
- Session removed from frontend storage
- User redirected to login page

---

## Components and Interfaces

### Frontend Components

#### 1. LoginPage Component
- **Purpose**: Display login/signup UI
- **Features**:
  - Google OAuth button (unified signup/login flow)
  - Error message display
  - Loading state during OAuth flow
  - Redirect to dashboard on success
- **State Management**: OAuth state, error messages, loading flag
- **Props**: None (uses router hooks)
- **Interaction**: Click → OAuth popup → Callback handling

#### 2. GoogleAuthCallback Component
- **Purpose**: Handle OAuth redirect callback
- **Features**:
  - Extract authorization code from URL params
  - Send code to backend
  - Store session token
  - Redirect to dashboard or login on error
- **Responsibilities**:
  - Parse URL query parameters
  - Call backend /auth/oauth endpoint
  - Handle token storage
  - Error display

#### 3. UserMenu Component
- **Purpose**: Display authenticated user info and logout
- **Features**:
  - Profile picture display
  - User name display
  - Dropdown menu
  - Logout button
- **Visibility**: Only shown when authenticated
- **Interaction**: Click → Show logout option → Logout

#### 4. ProtectedRoute Component
- **Purpose**: Route wrapper for authentication enforcement
- **Features**:
  - Check session token existence
  - Redirect to login if unauthenticated
  - Render component if authenticated
- **Usage**: Wrap dashboard, library, settings pages

#### 5. AuthContext / Hook
- **Purpose**: Global authentication state management
- **Provides**:
  - Current user data (email, name, picture)
  - Session token
  - Login/logout functions
  - Authentication status
- **Storage**: localStorage for token persistence
- **Listeners**: Window storage events for multi-tab sync

---

### Backend API Endpoints

#### Authentication Endpoints

**POST /auth/oauth**
```
Request:
{
  "code": "authorization_code_from_google"
}

Response (Success - 200):
{
  "success": true,
  "sessionToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "user_id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "profile_picture_url": "https://..."
  },
  "expiresIn": 86400
}

Response (Error - 400/401/500):
{
  "success": false,
  "message": "Error description"
}
```

**POST /auth/logout**
```
Request:
{
  Authorization: "Bearer sessionToken"
}

Response (Success - 200):
{
  "success": true,
  "message": "Logged out successfully"
}

Response (Error - 401):
{
  "success": false,
  "message": "Invalid or expired token"
}
```

#### User Endpoints

**GET /api/user/profile**
```
Request:
{
  Authorization: "Bearer sessionToken"
}

Response (Success - 200):
{
  "success": true,
  "user": {
    "user_id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "profile_picture_url": "https://...",
    "account_created_timestamp": "2024-01-15T10:00:00Z",
    "last_login_timestamp": "2024-01-20T14:30:00Z"
  }
}

Response (Error - 401):
{
  "success": false,
  "message": "Unauthorized"
}
```

#### Protected Recording Endpoints

**GET /api/recordings**
```
Request:
{
  Authorization: "Bearer sessionToken"
}

Response (Success - 200):
{
  "success": true,
  "recordings": [
    {
      "id": "uuid",
      "filename": "filename.wav",
      "originalName": "Original Name",
      "duration": 120.5,
      "size": 1024000,
      "type": "audio/wav",
      "isVideo": false,
      "transcription": "...",
      "createdAt": "2024-01-20T10:00:00Z",
      "user_id": "authenticated_user_id"
    }
  ]
}

Response (Error - 401):
{
  "success": false,
  "message": "Unauthorized"
}
```

**GET /api/recordings/:id**
```
Request:
{
  Authorization: "Bearer sessionToken"
}

Response (Success - 200):
{
  "success": true,
  "recording": { ... same as above ... }
}

Response (Error - 403):
{
  "success": false,
  "message": "Forbidden - recording belongs to different user"
}

Response (Error - 404):
{
  "success": false,
  "message": "Recording not found"
}
```

**DELETE /api/recordings/:id**
```
Request:
{
  Authorization: "Bearer sessionToken"
}

Response (Success - 200):
{
  "success": true,
  "message": "Recording deleted"
}

Response (Error - 403):
{
  "success": false,
  "message": "Forbidden - cannot delete recording of another user"
}

Response (Error - 404):
{
  "success": false,
  "message": "Recording not found"
}
```

---

## Data Models

### Session Token (JWT)

**Payload Structure**:
```json
{
  "sub": "google_subject_id",
  "user_id": "vnotes_user_uuid",
  "email": "user@example.com",
  "iat": 1705769400,
  "exp": 1705855800,
  "iss": "vnotes-backend"
}
```

**Properties**:
- `sub`: Google subject identifier (unique Google ID)
- `user_id`: VNotes user UUID (Supabase user_id)
- `email`: User email address
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp (iat + 24 hours)
- `iss`: Issuer claim (backend identifier)

**Signing**: HMAC-SHA256 with JWT_SECRET (256-bit minimum)

### User Profile (Supabase)

**Fields** (Managed by separate team):
- `user_id`: UUID (primary key)
- `google_id`: String (unique)
- `email`: String (unique)
- `name`: String
- `profile_picture_url`: String (optional)
- `account_created_timestamp`: Timestamp
- `last_login_timestamp`: Timestamp

### Recording Metadata (Supabase)

**Enhanced Structure**:
```json
{
  "id": "uuid",
  "filename": "1234567890-recording.wav",
  "originalName": "Meeting Notes",
  "duration": 120.5,
  "size": 1024000,
  "type": "audio/wav",
  "isVideo": false,
  "transcription": "...",
  "createdAt": "2024-01-20T10:00:00Z",
  "user_id": "authenticated_user_uuid",
  "isPrivate": true
}
```

**Ownership**: Every recording must include `user_id` that matches the authenticated user

### Session Store (In-Memory or Redis)

**Purpose**: Track revoked session tokens

**Structure**:
```json
{
  "revoked_sessions": {
    "session_token_jti_or_id": {
      "revoked_at": "2024-01-20T15:00:00Z",
      "user_id": "uuid",
      "expires_at": "2024-01-21T15:00:00Z"
    }
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Status | Scenario | Response |
|--------|----------|----------|
| 200 OK | Successful authentication, logout, or API call | JSON with success data |
| 400 Bad Request | Malformed request, missing required fields, invalid token format | Error message without details |
| 401 Unauthorized | Missing/invalid/expired token, OAuth verification failed | Error message with general reason |
| 403 Forbidden | Token valid but user lacks permission (cross-user access) | Clear message about ownership |
| 404 Not Found | Resource (recording, user) doesn't exist | Resource identifier + type |
| 500 Internal Server Error | Database error, token generation failure | Generic message, log details |

### Error Response Format

```json
{
  "success": false,
  "message": "User-facing error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-20T15:00:00Z"
}
```

### Specific Error Cases

**Invalid OAuth Code**:
```
Status: 400
Message: "Invalid authorization code"
Cause: Code expired, wrong audience, already used
Action: User clicks Google button again
```

**ID Token Verification Failed**:
```
Status: 401
Message: "Token verification failed"
Cause: Invalid signature, wrong issuer, expired
Action: User logs out and logs in again
```

**User Profile Not Found (Login)**:
```
Status: 200 (treated as new user)
Action: Create new profile in Supabase
```

**Cross-User Recording Access**:
```
Status: 403
Message: "Recording belongs to different user"
Details: Not revealed which user owns it
Action: User attempts different action
```

**Database Connection Error**:
```
Status: 500
Message: "Service temporarily unavailable"
Details: Actual error logged server-side only
Action: User retries after delay
```

**Expired Session Token**:
```
Status: 401
Message: "Session has expired. Please log in again."
Frontend Action: Redirect to login page
```

### Logging Strategy

**Security Sensitive** (log, don't expose):
- OAuth token exchanges
- Token verification failures
- Database errors
- Invalid signatures

**User Informative** (log and expose):
- User login/logout events
- Recording access attempts
- CORS violations

**Debug Only** (log in development):
- Full token payloads
- Complete error stacks
- Request/response bodies

---

## Testing Strategy

### Unit Tests

**JWT Generation & Validation**:
- Generate token with correct claims
- Validate token signature
- Handle expired tokens
- Reject tokens with invalid signature
- Extract user_id from valid token

**Token Format Validation**:
- Accept valid Bearer tokens
- Reject malformed Authorization header
- Reject missing Authorization header
- Return 400 for malformed, 401 for missing

**Recording Ownership Checks**:
- Allow user to access own recording
- Deny user from accessing other's recording
- Return 403 on unauthorized access
- Return 404 if recording doesn't exist

**OAuth Code Exchange** (mocked Google):
- Successfully exchange valid code
- Reject expired code
- Reject invalid signature
- Extract email/name from ID token

**Error Handling**:
- Database errors return 500
- Missing required fields return 400
- Expired tokens return 401
- Test with mock Supabase failures

### Integration Tests

**Complete OAuth Flow**:
- Mock Google OAuth server
- Verify redirect to Google
- Simulate authorization code
- Exchange code for tokens
- Verify session token received

**Recording Access Control**:
- Create recording as user A
- Verify user B cannot access
- Verify user A can access
- Verify user B gets 403

**Session Management**:
- Login and receive token
- Use token for API calls
- Logout and invalidate token
- Verify API calls fail after logout

**Multi-device Scenarios**:
- Same user logs in twice
- Each gets unique token
- Both tokens remain valid
- Logout on one device only

### Property-Based Tests

Given the focus on authentication logic and data consistency, property-based testing is applicable to:

**Round-Trip Properties**:
- FOR ANY valid Google ID token, the token verification process SHALL successfully authenticate and the extracted user_id SHALL persist in subsequent requests
- FOR ANY authenticated user, authentication followed by logout SHALL result in a subsequent unauthenticated state

**Invariants**:
- FOR ANY authenticated user, the user_id in the session token SHALL match the user_id in API request context
- FOR ANY recording created by user A, user B's queries SHALL never return that recording

**Idempotence**:
- FOR ANY user logging in multiple times, each login SHALL produce a valid unique session token
- FOR ANY user logging out and logging back in, the system state SHALL be identical to after initial login

**Error Conditions**:
- FOR ANY invalid session token, subsequent API requests SHALL return 401 Unauthorized
- FOR ANY cross-user access attempt, the API SHALL return 403 Forbidden

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage of authentication logic
- **Integration Tests**: All API endpoints with auth enforcement
- **Property Tests**: Token validation, ownership checks, state transitions
- **E2E Tests** (manual/Cypress): Complete user flows with UI

---

## Security Measures

### OAuth 2.0 Best Practices

✓ **Authorization Code Flow** (not Implicit)
- Server-side token exchange
- Authorization code never exposed to browser
- Tokens only sent to backend

✓ **PKCE** (Proof Key for Code Exchange)
- For public clients (SPA frontend)
- Prevents authorization code interception
- code_challenge and code_verifier

✓ **State Parameter**
- CSRF protection
- Generated on frontend
- Validated on callback
- Prevents cross-site request forgery

✓ **Redirect URI Validation**
- Whitelist registered URIs
- Prevent open redirects
- Exact matching required

### Token Security

✓ **JWT Signing**
- HMAC-SHA256 algorithm
- 256-bit+ secret key
- Stored in environment variables
- Different keys per environment

✓ **Token Storage** (Frontend)
- HttpOnly flag (if using cookies)
- Secure flag (HTTPS only)
- SameSite=Strict for cookies
- localStorage as fallback (with XSS mitigation)

✓ **Token Transmission**
- HTTPS only in production
- Authorization header (Bearer token)
- Never in URL parameters
- CORS credentials allowed

### Session Management

✓ **Token Revocation**
- Session store tracks revoked tokens
- Logout immediately invalidates token
- Revoked tokens cached for efficiency
- Cleanup after expiration + grace period

✓ **Token Rotation** (Future Enhancement)
- Refresh token endpoint
- Issue new access token before expiration
- Automatic rotation on activity

✓ **Rate Limiting**
- /auth/oauth endpoint: 5 attempts per IP per 5 min
- /auth/logout endpoint: 10 per IP per hour
- Prevents brute force and DDoS

### Data Protection

✓ **User Data in Supabase**
- Row-Level Security (RLS) policies
- Users can only see own profile
- Only Supabase team manages schema

✓ **Recording Ownership**
- Backend enforces user_id matching
- Frontend never trusts client-provided user_id
- Supabase RLS adds second layer

✓ **Sensitive Data Exclusion**
- Never return refresh tokens
- Never include JWT secret in response
- Minimal error messages in production

### Transport Security

✓ **HTTPS Enforcement**
- Required in production
- HSTS header enabled
- Certificate pinning (mobile apps)

✓ **CORS Configuration**
- Explicit origin whitelist
- No wildcard origins
- Credentials required flag set
- Preflight requests validated

✓ **Headers**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy for frontend

### Environment Security

✓ **Secrets Management**
- Google OAuth credentials in .env
- JWT_SECRET in .env
- Never commit .env file
- Different secrets per environment

✓ **Logging**
- No sensitive data in logs
- No tokens/passwords logged
- PII minimal in logs
- Audit trail for auth events

---

## Integration with Supabase

### Backend Responsibilities

The backend API will interact with Supabase via client libraries:

**1. User Profile Operations**

```typescript
// Create user profile (on signup)
const { data, error } = await supabase
  .from('user_profiles')
  .insert({
    google_id: googleSubject,
    email: googleEmail,
    name: googleName,
    profile_picture_url: googlePicture,
    account_created_timestamp: new Date(),
    last_login_timestamp: new Date()
  })
  .select()
  .single();

// Get user profile (on login)
const { data: user } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('google_id', googleSubject)
  .single();

// Update last_login_timestamp
const { data } = await supabase
  .from('user_profiles')
  .update({ last_login_timestamp: new Date() })
  .eq('google_id', googleSubject)
  .select()
  .single();
```

**2. Recording Operations**

```typescript
// Create recording with user_id
const { data: recording } = await supabase
  .from('recordings')
  .insert({
    filename: uploadedFileName,
    originalName: originalName,
    duration: duration,
    size: fileSize,
    type: mimeType,
    isVideo: isVideoFile,
    transcription: transcriptionText,
    createdAt: new Date(),
    user_id: authenticatedUserId,
    isPrivate: true
  })
  .select()
  .single();

// Get user's recordings (with RLS)
const { data: recordings } = await supabase
  .from('recordings')
  .select('*')
  .eq('user_id', authenticatedUserId)
  .order('createdAt', { ascending: false });

// Delete recording (verify ownership first)
const { error } = await supabase
  .from('recordings')
  .delete()
  .eq('id', recordingId)
  .eq('user_id', authenticatedUserId);
```

**3. Session Store** (Optional)

```typescript
// Store revoked session
const { data } = await supabase
  .from('revoked_sessions')
  .insert({
    token_jti: tokenId,
    user_id: userId,
    revoked_at: new Date(),
    expires_at: expirationTime
  });

// Check if token is revoked
const { data: revoked } = await supabase
  .from('revoked_sessions')
  .select('*')
  .eq('token_jti', tokenId)
  .single();
```

### Separation of Concerns

**Backend Handles**:
- OAuth token exchange with Google
- JWT generation and validation
- Authorization middleware
- Recording ownership enforcement (before DB call)
- Error handling and logging

**Supabase Team Handles**:
- User_Profile schema and migrations
- Recording schema with user_id
- RLS policies for row-level access
- Database performance and backups
- Authentication provider configuration (optional)

### Integration Points

1. **Authentication Callback**: Backend receives auth code → exchanges for tokens → extracts user data → calls Supabase
2. **Recording Upload**: Backend validates auth token → adds user_id → sends to Supabase
3. **Recording Query**: Backend validates auth token → queries Supabase with user_id filter → returns filtered results
4. **Recording Deletion**: Backend validates auth token → verifies ownership → calls Supabase delete

### Error Handling Between Systems

```
Backend                          Supabase
   │                                │
   ├─ Create user profile          │
   │                               ├─ Insert fails (duplicate email)
   │ ← Error response              │
   │                               │
   ├─ Log error                    │
   │                               │
   └─ Return 500 to client
```

---

## Deployment and Configuration

### Environment Variables (Backend)

```env
# OAuth Configuration
GOOGLE_OAUTH_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=xxxxxxxxxxxxxx
GOOGLE_OAUTH_CALLBACK_URI=https://backend.example.com/auth/oauth/callback

# JWT Configuration
JWT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
JWT_EXPIRATION=86400

# Supabase Configuration (handled by Supabase team)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxxxx

# Server Configuration
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://frontend.example.com

# Logging
LOG_LEVEL=info
```

### Environment Variables (Frontend)

```env
# OAuth Configuration
VITE_GOOGLE_OAUTH_CLIENT_ID=xxxxx.apps.googleusercontent.com
VITE_BACKEND_URL=https://api.example.com

# Other
VITE_APP_NAME=VNotes
```

### Deployment Checklist

**Pre-Deployment**:
- [ ] Generate strong JWT secret (256-bit)
- [ ] Register OAuth application with Google
- [ ] Set OAuth callback URIs for each environment
- [ ] Configure CORS origins
- [ ] Set environment variables in deployment platform
- [ ] Enable HTTPS for all endpoints
- [ ] Configure rate limiting

**Deployment Steps**:
- [ ] Deploy backend with auth middleware
- [ ] Deploy frontend with login components
- [ ] Verify OAuth endpoints are accessible
- [ ] Test end-to-end auth flow
- [ ] Monitor logs for errors
- [ ] Set up session cleanup job (optional)

**Post-Deployment**:
- [ ] Test login/signup with real Google accounts
- [ ] Verify session tokens work across requests
- [ ] Test cross-browser compatibility
- [ ] Monitor performance metrics
- [ ] Set up alerts for auth errors

---

## Future Enhancements

**Phase 2**:
- Token refresh endpoint (extend session without re-login)
- Public/shared recording support
- Session management UI (logged-in devices, remote logout)
- Account linking (connect multiple auth providers)

**Phase 3**:
- Multi-factor authentication (MFA)
- OAuth provider expansion (GitHub, Microsoft)
- Granular permissions/scopes
- Audit logging for compliance

**Phase 4**:
- SAML support for enterprise
- Single sign-on (SSO) federation
- Advanced session analytics
- Zero-trust architecture migration

---
## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Session Token Structure and Signing

**For any** authenticated user after OAuth token exchange, the generated session token SHALL be a valid JWT signed with the configured secret, contain required claims (user_id, email, google_id), and be decodable without verification errors.

**Validates: Requirements 3.1, 3.2**

**Test Strategy**: Generate random user data from Google tokens, create session tokens, verify structure is valid, claims are present, and signature is verifiable with the JWT secret.

### Property 2: Session Token Validation and Claim Extraction

**For any** valid session token, the validation process SHALL verify the signature, check expiration, and successfully extract the user_id claim for use in request context. For any invalid or expired token, validation SHALL fail and return rejection.

**Validates: Requirements 3.3, 3.4**

**Test Strategy**: Generate valid tokens with varying claims and expiration times, plus invalid tokens (wrong signature, expired, malformed), verify validation accepts valid ones and rejects invalid ones.

### Property 3: ID Token Signature Verification

**For any** ID token from Google's OAuth flow, the signature verification process SHALL successfully validate genuine tokens using Google's public keys and reject tokens with invalid signatures or wrong issuers.

**Validates: Requirements 1.3, 1.4, 1.5**

**Test Strategy**: Generate mock Google ID tokens with valid and invalid signatures, verify that signature verification catches tampering and invalid tokens.

### Property 4: Recording Ownership Enforcement

**For any** set of recordings created by different users, queries filtered by user_id SHALL return only recordings belonging to that user. Cross-user access attempts SHALL return 403 Forbidden responses, and deletions by non-owners SHALL be blocked.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

**Test Strategy**: Generate recordings from multiple users in Supabase, verify each user can only access/modify their own recordings. Generate cross-user access attempts, verify 403 responses.

### Property 5: Protected Endpoint Authorization

**For any** request to a protected endpoint without a valid Authorization header or with an invalid Bearer token, the middleware SHALL return 401 Unauthorized. All protected endpoints (/api/recordings, /auth/logout) SHALL consistently enforce this requirement.

**Validates: Requirements 7.1, 7.2**

**Test Strategy**: Generate requests with missing, malformed, expired, and invalid tokens. Verify all protected endpoints return 401/400 appropriately.

### Property 6: Session Token Revocation on Logout

**For any** session token successfully revoked via logout, subsequent API requests using that same token SHALL return 401 Unauthorized. Revocation SHALL be immediately effective with no grace period.

**Validates: Requirement 4.2**

**Test Strategy**: Create authenticated session, call logout endpoint, attempt API calls with same token, verify all requests return 401.

### Property 7: Session Token Uniqueness and Idempotence

**For any** user logging in multiple times with the same Google credentials, each login SHALL generate a unique session token. Multiple consecutive logins SHALL produce different tokens without conflicts, and logging out then logging in again SHALL produce a new valid token.

**Validates: Requirements 9.3, 9.4**

**Test Strategy**: Generate multiple OAuth flows for same user, collect all session tokens, verify no duplicates exist and all are valid.

### Property 8: CORS Header Presence

**For any** cross-origin request to the backend from configured origins, response headers SHALL include Access-Control-Allow-Origin, Access-Control-Allow-Methods, and Access-Control-Allow-Credentials appropriately configured.

**Validates: Requirement 11.1, 11.2**

**Test Strategy**: Make requests from various origins (allowed and disallowed), verify CORS headers are present and correct.

---
## Implementation Architecture Details

### Backend Module Structure

```
backend/src/
├── config/
│   ├── env.ts                 # Environment configuration with auth vars
│   └── oauth.ts               # Google OAuth configuration
├── controllers/
│   ├── authController.ts      # Authentication endpoints
│   ├── recordingController.ts # Modified for user_id enforcement
│   └── userController.ts      # User profile endpoints
├── middleware/
│   ├── authMiddleware.ts      # JWT validation middleware
│   └── corsMiddleware.ts      # CORS configuration
├── services/
│   ├── authService.ts         # JWT generation, OAuth token exchange
│   ├── tokenService.ts        # Token validation, revocation
│   ├── userService.ts         # User profile operations (Supabase)
│   ├── recordingService.ts    # Modified for ownership checks
│   └── googleOAuthService.ts  # Google token exchange, ID token verification
├── utils/
│   ├── errorHandler.ts        # Centralized error handling
│   ├── logger.ts              # Logging
│   ├── validators.ts          # Input validation
│   └── jwtUtils.ts            # JWT utilities
├── routes/
│   ├── authRoutes.ts          # /auth/* endpoints
│   ├── recordingRoutes.ts     # Modified recording routes with auth
│   └── userRoutes.ts          # /api/user/* endpoints
├── types/
│   ├── auth.ts                # Auth-related TypeScript interfaces
│   ├── session.ts             # Session token types
│   └── user.ts                # User profile types
└── server.ts                  # Modified to include auth middleware
```

### Authentication Service Pseudocode

```typescript
// JWT Token Generation
function generateSessionToken(userId: string, email: string, googleId: string): string {
  const payload = {
    sub: googleId,
    user_id: userId,
    email: email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + JWT_EXPIRATION,
    iss: 'vnotes-backend'
  };
  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });
}

// Token Validation
function validateSessionToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    
    // Check if token is revoked
    if (await isTokenRevoked(payload.sub)) {
      return null;
    }
    
    return payload;
  } catch (err) {
    // Invalid signature, expired, or other JWT error
    return null;
  }
}

// Google ID Token Verification
async function verifyGoogleIdToken(idToken: string): Promise<GoogleTokenPayload | null> {
  try {
    // Get Google's public keys
    const keys = await getGooglePublicKeys();
    
    // Decode token header to get key ID
    const header = jwt.decode(idToken, { complete: true }).header;
    const key = keys[header.kid];
    
    // Verify signature
    const payload = jwt.verify(idToken, key, {
      algorithms: ['RS256'],
      issuer: 'https://accounts.google.com'
    });
    
    // Verify client ID matches
    if (payload.aud !== GOOGLE_OAUTH_CLIENT_ID) {
      return null;
    }
    
    return payload;
  } catch (err) {
    return null;
  }
}

// OAuth Authorization Code Exchange
async function exchangeAuthorizationCode(code: string, redirectUri: string): Promise<OAuthTokenResponse | null> {
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      code: code,
      client_id: GOOGLE_OAUTH_CLIENT_ID,
      client_secret: GOOGLE_OAUTH_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });
    
    return response.data;
  } catch (err) {
    logger.error('OAuth token exchange failed', err);
    return null;
  }
}

// Complete OAuth Flow
async function handleOAuthCallback(code: string, redirectUri: string): Promise<AuthResponse | AuthError> {
  try {
    // 1. Exchange code for tokens
    const tokenResponse = await exchangeAuthorizationCode(code, redirectUri);
    if (!tokenResponse) {
      return { error: 'Invalid authorization code', statusCode: 400 };
    }
    
    // 2. Verify ID token signature
    const googlePayload = await verifyGoogleIdToken(tokenResponse.id_token);
    if (!googlePayload) {
      return { error: 'Token verification failed', statusCode: 401 };
    }
    
    // 3. Extract user data
    const googleEmail = googlePayload.email;
    const googleName = googlePayload.name;
    const googlePicture = googlePayload.picture;
    const googleSubject = googlePayload.sub;
    
    // 4. Get or create user profile in Supabase
    let user = await getUserProfileByGoogleId(googleSubject);
    if (!user) {
      user = await createUserProfile({
        google_id: googleSubject,
        email: googleEmail,
        name: googleName,
        profile_picture_url: googlePicture,
        account_created_timestamp: new Date(),
        last_login_timestamp: new Date()
      });
    } else {
      // Update last login
      await updateUserLastLogin(user.user_id);
    }
    
    // 5. Generate session token
    const sessionToken = generateSessionToken(user.user_id, user.email, googleSubject);
    
    return {
      success: true,
      sessionToken: sessionToken,
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        profile_picture_url: user.profile_picture_url
      },
      expiresIn: JWT_EXPIRATION
    };
  } catch (err) {
    logger.error('OAuth callback handling failed', err);
    return { error: 'Internal server error', statusCode: 500 };
  }
}
```

### Authentication Middleware Flow

```typescript
// Authentication Middleware
async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ success: false, message: 'Missing Authorization header' });
      return;
    }
    
    // 2. Extract Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(400).json({ success: false, message: 'Invalid Authorization header format' });
      return;
    }
    
    const token = parts[1];
    
    // 3. Validate token
    const payload = validateSessionToken(token);
    if (!payload) {
      res.status(401).json({ success: false, message: 'Invalid or expired token' });
      return;
    }
    
    // 4. Attach user to request
    req.userId = payload.user_id;
    req.userEmail = payload.email;
    req.googleId = payload.sub;
    
    next();
  } catch (err) {
    logger.error('Auth middleware error', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
```

### Recording Ownership Enforcement

```typescript
// Check recording ownership
async function verifyRecordingOwnership(recordingId: string, userId: string): Promise<boolean> {
  const { data: recording, error } = await supabase
    .from('recordings')
    .select('user_id')
    .eq('id', recordingId)
    .single();
  
  if (error || !recording) {
    return false;
  }
  
  return recording.user_id === userId;
}

// Delete recording with ownership check
async function deleteRecording(recordingId: string, userId: string, req: Request, res: Response): Promise<void> {
  try {
    // 1. Verify ownership
    const isOwner = await verifyRecordingOwnership(recordingId, userId);
    if (!isOwner) {
      res.status(403).json({ 
        success: false, 
        message: 'Cannot delete recording belonging to another user' 
      });
      return;
    }
    
    // 2. Delete from database
    const { error } = await supabase
      .from('recordings')
      .delete()
      .eq('id', recordingId)
      .eq('user_id', userId);
    
    if (error) {
      logger.error('Delete recording error', error);
      res.status(500).json({ success: false, message: 'Failed to delete recording' });
      return;
    }
    
    // 3. Delete file from storage
    const { data: recording } = await supabase
      .from('recordings')
      .select('filename')
      .eq('id', recordingId)
      .single();
    
    if (recording?.filename) {
      await deleteUploadedFile(recording.filename);
    }
    
    res.json({ success: true, message: 'Recording deleted' });
  } catch (err) {
    logger.error('Delete recording error', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
```

---

## API Implementation Endpoints

### Authentication Routes

**POST /auth/oauth**
- Handler: authController.handleOAuthCallback
- Middleware: None (public endpoint)
- Rate Limit: 5 per 5 min per IP
- Body: { code: string }
- Response: { sessionToken, user, expiresIn }

**POST /auth/logout**
- Handler: authController.handleLogout
- Middleware: authMiddleware
- Body: None (uses Authorization header)
- Response: { success, message }

### User Routes

**GET /api/user/profile**
- Handler: userController.getProfile
- Middleware: authMiddleware
- Params: None (uses req.userId from middleware)
- Response: { user: UserProfile }

### Recording Routes (Modified)

**GET /api/recordings**
- Handler: recordingController.listRecordings
- Middleware: authMiddleware
- Query: page, limit, sortBy
- Response: { recordings: Recording[], count, total }
- Backend behavior: Filters by req.userId

**GET /api/recordings/:id**
- Handler: recordingController.getRecording
- Middleware: authMiddleware
- Response: { recording: Recording }
- Backend behavior: Verifies ownership, returns 403 if not owner

**DELETE /api/recordings/:id**
- Handler: recordingController.deleteRecording
- Middleware: authMiddleware
- Response: { success, message }
- Backend behavior: Verifies ownership before deletion

---

## Frontend Component Implementation

### Login Page Component

```typescript
// LoginPage.tsx
export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = () => {
    setLoading(true);
    const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state: generateRandomState() // CSRF protection
    });
    
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  return (
    <div className="login-container">
      <button onClick={handleGoogleAuth} disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

### Auth Callback Handler

```typescript
// AuthCallback.tsx
export function AuthCallback() {
  const navigate = useNavigate();
  const { setAuthToken, setUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');

      if (!code) {
        navigate('/login?error=missing_code');
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/auth/oauth`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Authentication failed');
        }

        setAuthToken(data.sessionToken);
        setUser(data.user);
        navigate('/');
      } catch (err) {
        navigate(`/login?error=${encodeURIComponent(err.message)}`);
      }
    };

    handleCallback();
  }, []);

  return <div>Signing you in...</div>;
}
```

### User Menu Component

```typescript
// UserMenu.tsx
export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('sessionToken');
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      logout();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  if (!user) return null;

  return (
    <div className="user-menu">
      <img src={user.profile_picture_url} alt={user.name} />
      <button onClick={() => setOpen(!open)}>{user.name}</button>
      {open && (
        <div className="menu">
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}
```

---

## Summary of Design Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|-----------|
| OAuth 2.0 Authorization Code Flow | More secure than implicit; code never exposed to browser | Requires backend token exchange |
| JWT Session Tokens | Stateless; no session DB needed; easy to verify | Cannot be revoked immediately; token refresh needed |
| 24-hour Token Expiration | Balance between security and UX; reduces re-login friction | Tokens can be used for up to 24 hours if stolen |
| Bearer Token in Authorization Header | Standard; works with all HTTP clients; easy to validate | Requires HTTPS to prevent interception |
| User_id in Backend Queries | Enforces ownership at API layer; Supabase RLS adds 2nd layer | Requires frontend to trust backend (appropriate) |
| Session Revocation List | Enables immediate logout; lightweight for small systems | Needs cleanup job for expired entries |
| HMAC-SHA256 JWT Signing | Fast; sufficient for internal token validation | Different from OAuth RS256; not verifiable by external services |

---
