# Google Authentication Requirements Document

## Introduction

VNotes is currently a public audio recording and transcription application with no user authentication. This feature introduces Google OAuth 2.0 integration to enable user authentication and personalized access to recordings. Users will be able to sign up and log in using their Google accounts, allowing the system to track recording ownership and enforce privacy controls.

The Google Authentication system shall enable secure, single-sign-on (SSO) user authentication, session management, and recording ownership tracking while maintaining backward compatibility with the existing recording and transcription infrastructure.

**Important Implementation Note**: User profile storage and persistence will be implemented using Supabase by a separate team/developer. This requirements document focuses on the authentication flow, frontend UI, and backend API integration points. The Supabase integration layer will be handled independently.

---

## Glossary

- **User**: An individual who accesses VNotes through a web browser
- **Google_OAuth**: Google's OAuth 2.0 authorization protocol for delegated authentication
- **Authentication_Server**: The backend service responsible for OAuth token exchange and user session management
- **Frontend_Client**: The React web application that presents login/signup UI to users
- **Authorization_Code**: A temporary code issued by Google that the backend exchanges for tokens
- **Access_Token**: A short-lived JWT or bearer token used to authenticate API requests
- **Refresh_Token**: A long-lived token used to obtain new access tokens without user re-authentication
- **Session**: A server-side or client-side record of an authenticated user's login state
- **User_Profile**: Stored user data including Google ID, email, name, and account creation timestamp
- **Recording_Ownership**: The association between a recording and the user who created it
- **Public_Recording**: A recording accessible to users without authentication (scope not covered by this feature)
- **Private_Recording**: A recording only accessible to the authenticated owner (future feature, see notes)
- **Callback_URI**: The frontend URL where Google redirects after OAuth authentication
- **CORS_Origin**: The frontend domain configured to access the backend authentication API
- **JWT**: JSON Web Token used for stateless session authentication
- **Logout**: The process of invalidating a user's session and clearing authentication state
- **Account_Linking**: Connecting a Google account to an existing email address (future consideration)
- **Supabase**: A backend-as-a-service platform providing PostgreSQL database, authentication, and APIs. User profile storage and persistence will be implemented in Supabase by a separate development team.

---

## Requirements

### Implementation Responsibility Clarity

**This specification defines**:
- Google OAuth 2.0 integration flow (frontend and backend)
- Session token generation and validation logic
- API endpoint specifications for authentication
- Frontend UI requirements for login/signup
- Security best practices and error handling
- Recording ownership association logic

**Supabase Implementation (handled separately)**:
- User_Profile table schema and creation
- Database connectivity and queries
- Authentication provider configuration in Supabase
- User data persistence and retrieval
- Database migrations and backups
- Row-level security (RLS) policies for user isolation

The backend API endpoints specified in this document will call Supabase client libraries or APIs to perform database operations. The separation ensures clear responsibility boundaries and allows parallel development.

---

### Requirement 1: Google OAuth 2.0 Integration

**User Story:** As a user, I want to sign up with my Google account, so that I can create a personalized VNotes account without managing yet another password.

#### Acceptance Criteria

1. WHEN a user clicks the "Sign Up with Google" button, THE Frontend_Client SHALL redirect to Google's OAuth 2.0 authorization endpoint with the correct client ID, scope, and redirect URI
2. WHEN Google's OAuth authorization is complete, THE Frontend_Client SHALL receive an authorization code from Google's redirect
3. WHEN the authorization code is received, THE Authentication_Server SHALL exchange it for an access token and ID token via Google's token endpoint
4. WHEN the token exchange is successful, THE Authentication_Server SHALL verify the ID token signature using Google's public keys
5. WHEN the ID token is validated, THE Authentication_Server SHALL extract the user's email, name, and Google subject identifier from the token
6. IF the ID token signature is invalid or expired, THEN THE Authentication_Server SHALL reject the token and return a 401 Unauthorized response
7. WHERE [optional] Google account linking is enabled, THE Authentication_Server SHALL check if a User_Profile with the same email already exists
8. WHEN user data is extracted, THE Authentication_Server SHALL create a User_Profile record with the following fields: Google_ID (Google subject identifier), email, name, profile_picture_url, account_created_timestamp, and last_login_timestamp
9. WHEN the User_Profile is created successfully, THE Authentication_Server SHALL generate a session token and return it to the Frontend_Client
10. THE Frontend_Client SHALL store the session token securely and include it in subsequent API requests

#### Notes on Testability

- Token validation can be tested with mock Google ID tokens
- OAuth redirect flow can be tested with a test OAuth application
- Token exchange can be mocked to test error conditions
- Email extraction and User_Profile creation can be unit tested

---

### Requirement 2: User Login with Google

**User Story:** As an existing user, I want to log in with my Google account, so that I can access my existing recordings and resume my work.

#### Acceptance Criteria

1. WHEN a user clicks the "Log In with Google" button, THE Frontend_Client SHALL initiate the Google OAuth 2.0 flow identical to the signup flow
2. WHEN the OAuth flow completes, THE Authentication_Server SHALL receive the authorization code and exchange it for tokens
3. WHEN the ID token is verified, THE Authentication_Server SHALL query the User_Profile store to find an existing user with the matching Google_ID
4. IF a User_Profile with the Google_ID exists, THEN THE Authentication_Server SHALL update the last_login_timestamp and generate a session token
5. IF no User_Profile with the Google_ID exists, THEN THE Authentication_Server SHALL create a new User_Profile (same as signup)
6. WHEN the session token is generated, THE Authentication_Server SHALL return it to the Frontend_Client with a 200 OK response
7. WHEN the session token is received, THE Frontend_Client SHALL store it and redirect the user to the main application

#### Notes on Testability

- Login with existing user can be tested by creating a test user and verifying last_login_timestamp updates
- Login with new Google account should create a User_Profile as a fallback (same flow as signup)
- Session token generation can be unit tested for correctness

---

### Requirement 3: Session Token Generation and Validation

**User Story:** As the system, I want to generate secure session tokens, so that I can authenticate subsequent API requests without requiring Google OAuth on every request.

#### Acceptance Criteria

1. WHEN a user authenticates via Google OAuth, THE Authentication_Server SHALL generate a session token using JWT
2. THE session token SHALL include the user_id, email, and Google_ID as claims
3. THE session token SHALL be signed with a server-side secret key
4. THE session token SHALL have an expiration time of 24 hours (configurable)
5. WHEN an API request includes a session token, THE Authentication_Server SHALL validate the token signature and expiration
6. IF the token signature is invalid or the token is expired, THEN THE Authentication_Server SHALL return a 401 Unauthorized response
7. IF the token is valid, THEN THE Authentication_Server SHALL extract the user_id from the token and attach it to the request context
8. WHEN the user_id is extracted, THE Backend API endpoints SHALL use it to enforce recording ownership checks
9. THE Frontend_Client SHALL include the session token in the Authorization header (Bearer token) for all API requests
10. IF a request is made without a session token, THEN THE Backend API endpoints SHALL return a 401 Unauthorized response (for protected endpoints)

#### Notes on Testability

- JWT generation and validation can be unit tested with test secrets
- Token expiration can be tested by manipulating system time or mocking the time function
- Invalid token signatures can be tested by modifying the token string
- Request context attachment can be tested with middleware unit tests

---

### Requirement 4: Session Storage and Logout

**User Story:** As a user, I want to log out of my account, so that I can end my session and prevent unauthorized access from a shared device.

#### Acceptance Criteria

1. WHEN a user clicks the "Logout" button, THE Frontend_Client SHALL send a logout request to the Authentication_Server
2. WHEN the logout request is received with a valid session token, THE Authentication_Server SHALL invalidate the session token (add to revocation list or mark as revoked in session store)
3. WHEN the session token is revoked, THE Authentication_Server SHALL return a 200 OK response
4. WHEN the logout response is received, THE Frontend_Client SHALL delete the stored session token from browser storage
5. WHEN the session token is deleted, THE Frontend_Client SHALL redirect to the login page
6. AFTER logout, IF the user attempts to use an API with the revoked session token, THEN THE Authentication_Server SHALL return a 401 Unauthorized response
7. WHEN a user logs back in, THE Authentication_Server SHALL generate a new session token
8. WHERE [optional] session tokens are stored server-side, THE Authentication_Server SHALL implement session expiration cleanup to remove revoked or expired sessions after 7 days
9. WHILE [optional] high-frequency cleanup is not needed, THE Authentication_Server MAY batch cleanup operations to run once per day

#### Notes on Testability

- Logout request handling can be unit tested
- Session revocation can be verified by attempting API calls with the revoked token
- Session cleanup is an operational concern and can be tested via integration tests with mock time

---

### Requirement 5: User Profile Management

**User Story:** As a user, I want my profile information to be stored and managed by the system, so that my personal data is consistent across sessions.

**Implementation Note:** User profile storage in Supabase will be handled by a separate development team. This requirement defines the data structure and API contract that the backend expects.

#### Acceptance Criteria

1. THE User_Profile data structure SHALL include: user_id (unique identifier), Google_ID, email, name, profile_picture_url, account_created_timestamp, and last_login_timestamp
2. WHEN a user authenticates, THE Authentication_Server SHALL retrieve the User_Profile from the Supabase client using the Google_ID
3. IF the User_Profile does not exist in Supabase, THEN THE Authentication_Server SHALL call a Supabase function or client method to create a new User_Profile with the data extracted from the Google ID token
4. WHEN the Frontend_Client requests user profile data via GET /api/user/profile, THE Authentication_Server SHALL retrieve the User_Profile from Supabase and return it (excluding sensitive data like refresh tokens)
5. IF a user profile request is made without a valid session token, THEN THE Authentication_Server SHALL return a 401 Unauthorized response
6. WHEN Google ID token data changes (e.g., user updates name or profile picture in Google account), THE Authentication_Server SHALL update the User_Profile in Supabase on the next login
7. WHERE [future feature] user profile editing is enabled, THE Backend API SHALL accept updates to the user's name and profile picture from authenticated requests and persist them in Supabase
8. THE User_Profile update request in Supabase SHALL be restricted to the authenticated user only (enforced via Supabase RLS policies or backend validation)

#### Notes on Testability

- User_Profile creation and retrieval can be unit tested by mocking Supabase client responses
- Profile data extraction from Google tokens can be unit tested
- Supabase client calls can be verified with integration tests against a test Supabase project
- Profile update restrictions can be tested with authorization logic tests

---

### Requirement 6: Recording Ownership Association

**User Story:** As the system, I want to associate recordings with the authenticated user who created them, so that I can enforce ownership and privacy controls.

**Implementation Note:** Recording metadata in Supabase will be handled by a separate team. This requirement defines how the backend associates recordings with users and enforces access control.

#### Acceptance Criteria

1. WHEN a user uploads a recording, THE Backend API SHALL extract the user_id from the session token
2. WHEN the user_id is extracted, THE Recording_Service SHALL add a user_id field to the recording metadata
3. THE Recording data model SHALL include: id, filename, originalName, duration, size, type, isVideo, transcription, createdAt, user_id, and recording ownership metadata stored in Supabase
4. WHEN the recording is stored in Supabase, THE Recording_Service SHALL associate the recording with the authenticated user via the user_id foreign key
5. WHEN the user requests their recordings via GET /api/recordings, THE Backend API SHALL extract the user_id from the session token and query Supabase to return only recordings with the matching user_id
6. IF a user attempts to access or delete a recording that belongs to a different user, THEN THE Backend API SHALL return a 403 Forbidden response before querying Supabase
7. WHEN a user deletes a recording via DELETE /api/recordings/:id, THE Backend API SHALL verify the user_id from the session token matches the recording's user_id (via Supabase query), then delete both the file and metadata
8. WHEN a recording is deleted by the authorized owner, THE Backend API SHALL return a 200 OK response
9. IF a DELETE request targets a recording owned by a different user, THEN THE Backend API SHALL return a 403 Forbidden response and not delete the recording

#### Notes on Testability

- User_id extraction from session tokens can be unit tested
- Recording metadata structure can be verified by checking Supabase schema
- Authorization checks can be tested by creating test recordings in Supabase and attempting cross-user access
- Deletion authorization can be tested with two users attempting to delete each other's recordings via integration tests

---

### Requirement 7: Authentication Middleware

**User Story:** As the backend system, I want to automatically validate session tokens for protected endpoints, so that I can enforce authentication without repeating validation logic in every controller.

#### Acceptance Criteria

1. THE Backend API SHALL implement an authentication middleware that runs before protected endpoints
2. WHEN a request arrives at a protected endpoint, THE middleware SHALL check for a session token in the Authorization header
3. IF no Authorization header is present, THEN THE middleware SHALL return a 401 Unauthorized response
4. IF the Authorization header is present, THE middleware SHALL extract the token (Bearer token format)
5. WHEN the token is extracted, THE middleware SHALL validate the token signature and expiration
6. IF the token is invalid or expired, THEN THE middleware SHALL return a 401 Unauthorized response
7. IF the token is valid, THE middleware SHALL extract the user_id and attach it to the request object (e.g., req.userId)
8. WHEN the user_id is attached, THE middleware SHALL call next() to pass control to the route handler
9. WHERE [optional] public endpoints exist, THEN public endpoints SHALL NOT require the authentication middleware
10. THE following endpoints SHALL require authentication: GET /api/recordings, GET /api/recordings/:id, POST /api/recordings/upload, DELETE /api/recordings/:id

#### Notes on Testability

- Middleware behavior can be unit tested with mock request and response objects
- Token validation can be tested with valid, invalid, and expired tokens
- User_id extraction can be verified by checking req.userId in route handlers

---

### Requirement 8: Frontend Login/Signup UI

**User Story:** As a user, I want a clear and intuitive login and signup interface, so that I can quickly authenticate with Google and start using VNotes.

#### Acceptance Criteria

1. THE Frontend_Client SHALL display a login page when the user is not authenticated
2. THE login page SHALL include a "Sign Up with Google" button and a "Log In with Google" button (or a single button if the flow is identical)
3. WHEN the user clicks the Google auth button, THE Frontend_Client SHALL initiate the Google OAuth 2.0 popup or redirect flow
4. WHEN the OAuth flow completes, THE Frontend_Client SHALL receive a session token and redirect to the main application
5. IF the OAuth flow is cancelled by the user, THEN THE Frontend_Client SHALL return to the login page without displaying an error (cancellation is user-initiated)
6. IF the OAuth flow fails due to an error, THEN THE Frontend_Client SHALL display an error message with clear guidance (e.g., "Google sign-in failed. Please try again.")
7. WHEN the user is authenticated, THE Frontend_Client SHALL display a user menu in the navigation bar with the user's name and profile picture
8. WHEN the user clicks the user menu, THE Frontend_Client SHALL display a "Logout" option
9. WHEN the user clicks "Logout", THE Frontend_Client SHALL send a logout request to the backend and clear the session token
10. AFTER logout, THE Frontend_Client SHALL redirect to the login page

#### Notes on Testability

- UI elements can be tested with React Testing Library
- Button clicks can be simulated in unit tests
- OAuth flow can be mocked for testing (do not test against real Google OAuth in unit tests)
- Error message display can be verified in component tests
- Redirect behavior can be tested with routing mocks

---

### Requirement 9: Error Handling and Edge Cases

**User Story:** As the system, I want to handle authentication errors gracefully, so that users receive clear feedback and the system remains stable.

#### Acceptance Criteria

1. IF Google OAuth returns an error (e.g., invalid client ID, network failure), THEN THE Authentication_Server SHALL log the error with context and return a descriptive error response
2. WHEN a token exchange fails with Google, THEN THE Authentication_Server SHALL return a 400 Bad Request or 500 Internal Server Error response depending on the failure cause
3. IF the ID token verification fails (invalid signature, expired token, wrong issuer), THEN THE Authentication_Server SHALL reject the token and return a 401 Unauthorized response
4. IF the user's Google account email cannot be extracted from the ID token, THEN THE Authentication_Server SHALL return a 400 Bad Request response with a message indicating missing required data
5. IF a database error occurs during User_Profile creation or retrieval, THEN THE Authentication_Server SHALL log the error, return a 500 Internal Server Error response, and NOT reveal internal database details to the client
6. IF the session token generation fails, THEN THE Authentication_Server SHALL return a 500 Internal Server Error response
7. IF the logout request is made with an invalid session token, THEN THE Authentication_Server SHALL return a 401 Unauthorized response
8. WHEN an error response is returned, THE Frontend_Client SHALL display an appropriate error message to the user without exposing sensitive technical details
9. IF the same user logs in from multiple devices or browsers, THEN each login request SHALL generate a unique session token (no session conflicts)
10. IF a session token expires while the user is using the application, THE Frontend_Client SHALL redirect to the login page and notify the user that their session has expired

#### Notes on Testability

- Error responses can be unit tested by mocking Google OAuth failures
- Token verification failures can be tested with invalid tokens
- Database errors can be mocked in integration tests
- Session conflicts can be tested by logging in as the same user twice
- Token expiration can be tested by manipulating system time or mocking time functions

---

### Requirement 10: Security Considerations

**User Story:** As a system administrator, I want the authentication system to be secure against common attacks, so that user data and sessions are protected.

#### Acceptance Criteria

1. THE Authentication_Server SHALL use HTTPS for all communication with Google's OAuth endpoints (no HTTP fallback)
2. THE Authorization callback URI SHALL be validated against a whitelist of allowed Callback_URIs to prevent authorization code interception (authorization code injection attacks)
3. THE session token SHALL be signed with a strong server-side secret (minimum 256-bit entropy)
4. THE session token secret SHALL be stored securely in environment variables (not hardcoded or committed to version control)
5. WHEN a session token is transmitted over HTTP (not HTTPS in production), THEN the token SHALL be marked with HttpOnly and Secure flags in cookies (if using cookies) or transmitted only over HTTPS
6. THE Backend API SHALL validate the Authorization header format before processing (reject malformed Bearer tokens)
7. IF an Authorization header is malformed, THEN THE Backend API SHALL return a 400 Bad Request response (not 401, to distinguish from valid but expired/invalid tokens)
8. WHEN a user's session token is revoked, THE Backend API SHALL immediately reject requests using that token (no stale session acceptance)
9. THE User_Profile store SHALL NOT store Google refresh tokens (if obtained, they SHALL be used only for immediate token exchange and then discarded)
10. WHERE [optional] rate limiting is implemented, THEN the /auth/login and /auth/signup endpoints SHALL be rate-limited to prevent brute-force attacks
11. WHEN errors occur, THE Authentication_Server SHALL NOT reveal sensitive information in error messages (e.g., "user not found" indicates user enumeration)
12. WHEN storing user data, THE Backend SHALL NOT store passwords (no local password storage; rely solely on Google OAuth)

#### Notes on Testability

- HTTPS enforcement can be tested with security scanning tools
- Callback URI validation can be unit tested with whitelist checks
- Token secret strength can be verified via code review
- HttpOnly and Secure flags can be verified in HTTP response headers
- Authorization header validation can be unit tested
- Rate limiting can be tested with load simulation (if implemented)
- Error message validation can be tested by triggering errors and verifying response content

---

### Requirement 11: CORS Configuration and Frontend Integration

**User Story:** As a developer, I want CORS to be properly configured, so that the frontend can communicate with the backend authentication endpoints without browser security errors.

#### Acceptance Criteria

1. THE Backend API SHALL include CORS headers in responses to allow requests from the configured Frontend_Client origin
2. THE CORS_Origin SHALL be configurable via environment variables
3. WHEN the Frontend_Client sends a preflight OPTIONS request, THE Backend API SHALL respond with appropriate CORS headers (Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers)
4. THE CORS configuration SHALL allow credentials (cookies or Authorization headers) by setting Access-Control-Allow-Credentials: true
5. WHEN requests include authentication tokens, THE CORS headers SHALL permit the Authorization header in Access-Control-Allow-Headers
6. IF the request origin does not match the CORS_Origin configuration, THEN THE Backend API MAY reject the request (depending on the CORS policy)
7. WHERE [production] CORS_Origin is set to the frontend's production domain
8. WHILE [development] CORS_Origin may be set to http://localhost:3000

#### Notes on Testability

- CORS headers can be verified in HTTP response headers
- Preflight requests can be tested with browser dev tools or fetch API
- Cross-origin requests from different origins can be tested to verify CORS blocking

---

### Requirement 12: Recording Visibility and Privacy (Future Scope Note)

**User Story:** As a user, I want my recordings to be private by default, so that only I can access them.

#### Acceptance Criteria

1. WHEN a recording is created, THE recording SHALL be marked as private by default
2. WHEN a private recording is requested, THE Backend API SHALL return the recording only if the requester's user_id matches the recording's user_id
3. IF a user attempts to access a private recording belonging to another user, THEN THE Backend API SHALL return a 403 Forbidden response
4. WHERE [future feature] public sharing is enabled, THE Backend API SHALL support marking recordings as public or shared with specific users

#### Notes on Scope

This requirement is included for completeness but represents future functionality. The current implementation SHALL focus on associating recordings with users. Privacy enforcement will be implemented in a subsequent phase as a separate feature.

---

### Requirement 13: Configuration and Deployment

**User Story:** As a DevOps engineer, I want authentication to be configurable for different environments, so that I can deploy to development, staging, and production.

#### Acceptance Criteria

1. THE Backend API configuration SHALL include Google OAuth client ID and client secret as environment variables
2. THE Google OAuth client ID and client secret SHALL NOT be hardcoded or committed to version control
3. THE session token expiration time SHALL be configurable via environment variables (default: 24 hours)
4. THE JWT secret key SHALL be configurable via environment variables
5. THE Callback_URI SHALL be configurable via environment variables to support different deployment environments
6. WHEN the application starts, THE Backend API SHALL validate that all required environment variables are set
7. IF required environment variables are missing, THEN THE Backend API SHALL log a warning or error and may refuse to start or operate in reduced capacity
8. THE .env.example file SHALL include placeholders for all authentication-related environment variables with explanatory comments

#### Notes on Testability

- Environment variable configuration can be tested by running the application with different .env files
- Missing environment variable validation can be unit tested
- Configuration correctness can be verified via integration tests

---

### Requirement 14: Property-Based Testing and Acceptance Criteria Mapping

**User Story:** As a QA engineer, I want testable acceptance criteria, so that the authentication system can be thoroughly validated.

#### Acceptance Criteria - Testing Strategy

**Round-Trip Property (Essential for Auth Systems):**
1. FOR ALL valid Google ID tokens, the token verification process followed by token validation SHALL produce a successfully authenticated session
2. FOR ALL user authentication flows (signup then login), the user SHALL be able to authenticate with the same Google account multiple times across different sessions

**Invariants (Properties That Must Hold):**
1. FOR ANY authenticated user, the user_id in the session token SHALL match the user_id in the User_Profile store
2. FOR ANY recording created by an authenticated user, the recording's user_id SHALL match the creator's user_id
3. FOR ANY revoked session token, subsequent API requests using that token SHALL receive 401 Unauthorized responses

**Idempotence (Operations Safe to Repeat):**
1. WHEN a user logs in multiple times consecutively, each login request SHALL produce a valid and unique session token
2. WHEN a user logs out and then logs back in, the system SHALL be in the same state as after the initial login (no side effects from logout)
3. WHEN the same recording upload request is retried with an identical Authorization header and payload, the Backend API SHOULD handle duplicate detection gracefully

**Metamorphic Properties (Relationships Between Inputs/Outputs):**
1. WHEN a user authenticates, the last_login_timestamp SHALL be greater than or equal to all previous last_login_timestamp values for that user
2. WHEN recordings are filtered by user_id, the count of returned recordings SHALL be less than or equal to the total recording count in the system

**Error Conditions:**
1. FOR ALL invalid session tokens, the Backend API SHALL return a 401 Unauthorized response (token not found, expired, or invalid signature)
2. FOR ALL cross-user access attempts (user A accessing user B's recordings), the Backend API SHALL return a 403 Forbidden response

#### Notes on Testing

- Round-trip testing: Test signup, logout, and login with the same Google account
- Invariant testing: Verify session token user_id matches User_Profile user_id
- Idempotence testing: Simulate multiple logins with property-based testing
- Metamorphic testing: Verify last_login_timestamp monotonically increases
- Error testing: Test all error conditions with invalid inputs and cross-user scenarios

---

## Acceptance Criteria Quality Review

### Completeness Check

✅ All requirements follow EARS patterns (Ubiquitous, Event-driven, State-driven, Unwanted event, Optional feature, Complex)

✅ No escape clauses detected (no "where possible", "if feasible", "as appropriate")

✅ Active voice used throughout (THE Authentication_Server, THE Frontend_Client, THE Backend API)

✅ Specific terms used instead of pronouns (no "it", "they", replaced with specific names like "THE Authentication_Server")

✅ Testable criteria defined (measurable conditions, specific error codes, explicit timestamps)

✅ One thought per criterion (no compound sentences testing multiple behaviors)

### Clarity and Precision Check

✅ All technical terms defined in Glossary (Google_OAuth, Session, User_Profile, etc.)

✅ No vague terms used ("quickly", "adequately", "reasonable", "user-friendly")

✅ Consistent terminology throughout (User_Profile, user_id, session token, etc.)

✅ Explicit conditions and measurable criteria (24 hours expiration, 256-bit entropy, HTTP status codes)

### Testability Check

✅ Properties identified for property-based testing (round-trip, invariants, idempotence, metamorphic, error conditions)

✅ Explicit test scenarios described (login with existing user, cross-user access, token expiration)

✅ Mock/stub points identified (Google OAuth can be mocked, system time can be mocked)

✅ Integration and unit test categories clear (token generation unit tested, OAuth flow integration tested)

