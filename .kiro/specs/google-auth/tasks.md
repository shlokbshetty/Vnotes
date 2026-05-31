# Implementation Plan: Google Authentication Feature

## Overview

This implementation plan breaks down the Google OAuth 2.0 authentication feature into discrete, actionable coding tasks. The plan follows the authorization code flow architecture defined in the design document, with separate phases for frontend UI, backend API infrastructure, OAuth integration, session management, recording ownership enforcement, error handling, and comprehensive testing.

Each task builds incrementally, starting with authentication infrastructure and middleware, then implementing frontend UI components, followed by recording ownership enforcement, and finally comprehensive testing including property-based tests for core correctness properties.

---

## Tasks

### Phase 1: Backend Authentication Infrastructure

- [x] 1. Backend authentication infrastructure setup and JWT implementation
  - [x] 1.1 Set up project structure and utilities
    - Create `/src/services/authService.ts` for JWT generation and validation
    - Create `/src/middlewares/authMiddleware.ts` for request authentication
    - Create `/src/utils/sessionStore.ts` for session revocation tracking (in-memory)
    - Create `/src/types/auth.ts` with TypeScript interfaces for auth types
    - Add JWT and Google OAuth dependencies (jsonwebtoken, google-auth-library)
    - _Requirements: 3.1, 3.2, 7.1, 10.3_
  
  - [x] 1.2 Implement JWT token signing, validation, and claim extraction
    - Create JWT signing utility with configurable expiration (HS256, claims: sub, user_id, email, iat, exp)
    - Write property test for JWT generation (Property 1)
    - Create JWT validation utility with signature, expiration, and claims verification
    - Verify tokens can be decoded without errors with various user data inputs
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 10.3_
  
  - [x] 1.3 Implement authentication middleware and protected endpoint authorization
    - Create middleware for Bearer token extraction, format validation (400 for malformed), and validation
    - Extract Authorization header and attach user_id to request context (req.userId)
    - Write property test for protected endpoint authorization (Property 5)
    - Test requests without Authorization header return 401
    - Test requests with invalid/expired tokens return 401
    - Test requests with valid tokens allow passage
    - Test malformed Bearer tokens return 400
    - Apply authMiddleware to GET /api/recordings, GET /api/recordings/:id, POST /api/recordings/upload, DELETE /api/recordings/:id
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_
  
  - [x] 1.4 Implement session store and revocation logic
    - Implement in-memory session revocation store with token identifiers and timestamps
    - Implement session revocation check in validation (query store, return 401 for revoked tokens)
    - _Requirements: 4.2, 4.6, 4.8_

- [x] 2. Backend checkpoint - Verify authentication infrastructure
  - Ensure authentication middleware properly validates tokens
  - Ensure protected endpoints are protected
  - Run unit tests for auth service, middleware, and JWT functions
  - Verify session revocation works correctly

### Phase 2: Google OAuth Integration and User Management

- [x] 3. Google OAuth configuration and token exchange
  - [x] 3.1 OAuth configuration and setup
    - Load GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET from env
    - Configure Google OAuth endpoints
    - Initialize Google Auth library
    - _Requirements: 13.1, 13.2, 13.4_
  
  - [x] 3.2 Implement Google token exchange
    - Implement authorization code to token exchange
    - Call Google token endpoint
    - Handle token exchange errors
    - _Requirements: 1.2, 1.3, 2.1, 2.2_

- [x] 4. ID token verification and user data extraction
  - [x] 4.1 ID token signature verification and claim extraction
    - Create ID token signature verification utility
    - Fetch Google's public JWKS keys
    - Verify ID token signature
    - Validate token issuer and expiration
    - Write property test for ID token verification (Property 3)
    - Generate mock Google ID tokens with valid and invalid signatures
    - Verify valid tokens pass verification
    - Verify tampered/expired tokens are rejected
    - Extract email, name, profile picture URL, and google_id (sub) from ID token
    - Handle missing or malformed claims with error responses
    - _Requirements: 1.4, 1.5, 1.6, 1.5, 5.1_

- [x] 5. OAuth callback endpoint and logout
  - [x] 5.1 Implement POST /auth/oauth endpoint
    - Accept authorization code from frontend
    - Exchange code for Google tokens
    - Verify ID token signature
    - Extract user data (email, name, picture, google_id)
    - Call Supabase to create/update user profile
    - Generate session JWT
    - Return session token and user data
    - Handle OAuth errors: 400 for invalid/expired code, 401 for ID token verification, 500 for DB errors
    - Log errors with context without exposing sensitive data
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 3.0, 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [x] 5.2 Implement POST /auth/logout endpoint
    - Require valid session token
    - Add token to revocation store
    - Return 200 OK response
    - Handle logout errors: 401 for invalid/missing tokens, graceful session store failures
    - _Requirements: 4.1, 4.2, 4.3, 4.8, 4.7, 9.7_

- [x] 6. User profile endpoint
  - [x] 6.1 Implement GET /api/user/profile endpoint
    - Require valid session token
    - Query Supabase for authenticated user's profile
    - Return profile data (exclude sensitive data)
    - Handle profile retrieval errors: 401 for invalid token, 500 for DB errors with safe messages
    - _Requirements: 5.2, 5.4, 5.5, 9.5_

- [x] 7. OAuth integration checkpoint
  - Test OAuth redirect and callback flow with mock Google responses
  - Verify session tokens are generated correctly
  - Run integration tests for auth endpoints

### Phase 3: Recording Ownership Enforcement and Access Control

- [x] 8. Recording upload with user ownership
  - [x] 8.1 Update recording upload to associate user_id
    - Extract user_id from authenticated request (req.userId from middleware)
    - Add user_id to recording metadata
    - Store user_id in Supabase recording entry
    - Update recordingService to include user_id in metadata
    - Pass user_id through to Supabase insert call
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 9. Recording access control and ownership verification
  - [x] 9.1 Implement user-scoped recording access
    - Add user_id filtering to GET /api/recordings endpoint
    - Query Supabase for recordings matching user_id only
    - Return only user's own recordings
    - _Requirements: 6.5_
  
  - [x] 9.2 Add ownership verification to recording retrieval
    - Implement GET /api/recordings/:id with ownership check
    - Extract user_id from session token
    - Query recording from Supabase with both id and user_id filter
    - Return 403 Forbidden if recording belongs to different user
    - Return 404 if recording not found or filtered out
    - _Requirements: 6.5, 6.6_
  
  - [x] 9.3 Add ownership verification to recording deletion
    - Implement DELETE /api/recordings/:id with ownership verification
    - Extract user_id from session token
    - Verify recording's user_id matches authenticated user (from Supabase query)
    - Return 403 Forbidden if ownership verification fails
    - Delete recording file and metadata only after verification
    - Delete audio file from uploads directory
    - Delete metadata from Supabase
    - Handle both failures gracefully
    - _Requirements: 6.7, 6.8, 6.9_
  
  - [x] 9.4 Write property test for recording ownership enforcement (Property 4)
    - Create recordings from multiple users in test database
    - Verify each user can only query their own recordings
    - Verify cross-user queries return empty results
    - Verify unauthorized user_ids cannot be spoofed from client
    - Verify delete operations fail for non-owners
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 10. Recording ownership checkpoint
  - Test recording upload includes user_id
  - Test user cannot access other user's recordings
  - Test user cannot delete other user's recordings
  - Run integration tests with multi-user scenarios

### Phase 4: Frontend Authentication UI Components

- [ ] 11. Frontend authentication context and hooks
  - [x] 11.1 Create authentication types and context
    - Define TypeScript interfaces for auth context
    - User interface (user_id, email, name, profile_picture_url)
    - Auth context interface with login/logout methods
    - Session token storage interface
    - _Requirements: 8.7, 8.8_
  
  - [x] 11.2 Implement AuthContext and useAuth hook
    - Create React Context for authentication state
    - Manage current user state and session token state
    - Provide login and logout methods
    - Handle localStorage persistence and multi-tab sync
    - Create useAuth custom hook with context error handling
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 12. Frontend login and OAuth flow
  - [x] 12.1 Create LoginPage component
    - Build UI with "Sign Up / Log In with Google" button
    - Show loading state during OAuth flow
    - Display error messages if OAuth fails
    - Generate OAuth state parameter (CSRF protection)
    - Build Google authorization URL with client ID, scopes, redirect URI
    - Initiate OAuth popup or redirect
    - _Requirements: 8.1, 8.2, 8.6, 1.1, 2.1_
  
  - [x] 12.2 Create GoogleAuthCallback component
    - Extract authorization code from URL query params
    - Extract and verify state parameter (CSRF protection)
    - Send code to backend POST /auth/oauth
    - Receive session token from backend
    - Store token in localStorage
    - Update auth context with user data
    - Redirect to dashboard/library page on success
    - Display user-friendly error message on failure
    - Redirect to login page on error
    - Handle user cancellation gracefully
    - _Requirements: 1.2, 1.9, 1.10, 8.5, 8.6, 9.8_

- [x] 13. Frontend user menu and protected routes
  - [x] 13.1 Create UserMenu component
    - Build UI with user's profile picture
    - Display user's name
    - Show dropdown menu on click
    - Display "Logout" option in menu
    - Send logout request to backend
    - Remove session token from localStorage
    - Clear auth context
    - Redirect to login page
    - _Requirements: 8.7, 8.8, 4.1, 8.9, 8.10_
  
  - [x] 13.2 Create ProtectedRoute component and integrate
    - Implement route protection wrapper
    - Check if user is authenticated (token in context)
    - Redirect to login if unauthenticated
    - Render component if authenticated
    - Wrap recording page, library page, settings page, user profile page with ProtectedRoute
    - _Requirements: 3.10_

- [x] 14. Frontend API client updates
  - [x] 14.1 Update API client with authorization header
    - Modify API service to extract token from localStorage
    - Add Authorization header to all API requests
    - Handle 401 responses by redirecting to login
    - Detect 401 responses indicating expired session
    - Display "Session expired" message to user
    - Redirect to login page on session expiration
    - _Requirements: 3.9, 3.10, 9.10_

- [x] 15. Frontend components checkpoint
  - Test LoginPage renders and OAuth flow initiates
  - Test GoogleAuthCallback receives code and exchanges for token
  - Test UserMenu displays when authenticated
  - Test ProtectedRoute redirects unauthenticated users
  - Run unit tests for React components using React Testing Library

### Phase 5: Error Handling, Security Configuration, and Testing

- [x] 16. Error handling and CORS configuration
  - [x] 16.1 Implement comprehensive error handling
    - Add error handling to POST /auth/oauth (Google token exchange failures, ID token verification failures, Supabase errors)
    - Add error handling to protected endpoints (missing Supabase responses, recording query failures)
    - Return appropriate HTTP status codes and messages (400, 401, 403, 500)
    - Log errors without exposing sensitive data
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
  
  - [x] 16.2 Configure CORS and security headers
    - Update CORS configuration in Express
    - Set CORS origin from CORS_ORIGIN environment variable
    - Allow credentials (Authorization headers)
    - Include Authorization in Access-Control-Allow-Headers
    - Add security headers: X-Content-Type-Options: nosniff, X-Frame-Options: DENY, X-XSS-Protection: 1; mode=block
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 10.1_
  
  - [x] 16.3 Implement rate limiting and environment variables
    - Add rate limiting middleware for auth endpoints
    - Limit /auth/oauth to 5 attempts per IP per 5 minutes
    - Limit /auth/logout to 10 attempts per IP per hour
    - Return 429 Too Many Requests when limit exceeded
    - Update .env.example with all required variables and comments
    - _Requirements: 10.10, 13.8_

- [x] 17. Security checkpoint and property-based testing
  - Test error responses with various failure scenarios
  - Verify CORS headers are present in responses
  - Test rate limiting on auth endpoints
  - Verify environment variables are properly loaded

- [x] 18. Core property-based tests for authentication logic
  - [x] 18.1 Write comprehensive property tests
    - **Property 1: Session Token Structure and Signing** (already completed in task 1.2)
    - **Property 2: Session Token Validation and Claim Extraction**
      - Generate random user data
      - Create multiple tokens with different claims
      - Verify all tokens are structurally valid
      - Verify claims can be extracted correctly
    - **Property 3: ID Token Signature Verification** (already in task 4.1)
    - **Property 4: Recording Ownership Enforcement** (already in task 9.4)
    - **Property 5: Protected Endpoint Authorization** (already in task 1.3)
    - **Property 6: Session Token Revocation on Logout**
      - Create valid token
      - Call logout endpoint to revoke
      - Verify token cannot be used for API calls after revocation
      - Verify new login creates different valid token
    - _Requirements: 14.1, 3.1, 3.2, 3.3, 3.4, 1.4, 1.5, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 4.2, 4.3, 4.6_

- [x] 19. Unit tests for authentication services
  - [x] 19.1 Write unit tests for all services
    - Unit tests for JWT service (generation, validation, expiration, claim extraction)
    - Unit tests for OAuth service (mock Google endpoint, successful exchange, error handling, ID token extraction)
    - Unit tests for session store (revocation storage, lookup, expiration)
    - _Requirements: 14.1_

- [x] 20. Integration tests for authentication flows
  - [x] 20.1 Write comprehensive integration tests
    - Test complete OAuth signup flow (code exchange, user profile creation, token generation)
    - Test complete OAuth login flow (existing user, last_login_timestamp update, token generation)
    - Test logout flow (token revocation, API call rejection)
    - Test multi-user recording scenarios (user A uploads, user B cannot access, user A can access/delete)
    - Test recording metadata includes user_id
    - _Requirements: 14.1_

- [x] 21. Frontend component tests
  - [ ] 21.1 Write unit tests for React components
    - Unit tests for LoginPage (Google button render, OAuth state generation, click handler)
    - Unit tests for GoogleAuthCallback (URL parameter extraction, state verification, backend API call, token storage/redirect)
    - Unit tests for UserMenu (authenticated render, user info display, logout functionality)
    - Unit tests for ProtectedRoute (authenticated render, unauthenticated redirect, token expiration handling)
    - _Requirements: 14.1_

- [x] 22. Testing checkpoint
  - Run unit test suite (80%+ coverage of auth logic)
  - Run property-based tests for core properties
  - Run integration tests for complete flows
  - Run frontend component tests

### Phase 6: Documentation and Final Deployment

- [x] 23. Documentation and deployment preparation
  - [ ] 23.1 Create API documentation
    - Document POST /auth/oauth endpoint (request/response/errors)
    - Document POST /auth/logout endpoint
    - Document GET /api/user/profile endpoint
    - Include request/response examples
    - Document all error responses
    - _Requirements: 36.1_
  
  - [ ] 23.2 Create setup and deployment guides
    - Create setup guide for developers (environment variables, OAuth app setup, JWT secret generation, local dev setup)
    - Create pre-deployment requirements checklist (production JWT secret, production Google OAuth app, production CORS origin, environment variables, HTTPS)
    - _Requirements: 37.1, 38.1_

- [x] 24. Final integration and comprehensive testing
  - [ ] 24.1 Final integration verification
    - Test complete user flow: login → access recording → logout
    - Test multi-user scenarios
    - Test error cases and recovery
    - Verify CORS configuration allows frontend-backend communication
    - Test preflight OPTIONS requests
    - Test actual API calls with Authorization header
    - _Requirements: 39.1, 39.2_
  
  - [ ] 24.2 Final test suite verification
    - All unit tests passing (80%+ coverage of auth logic)
    - All integration tests passing
    - All property-based tests passing
    - Frontend tests passing
    - _Requirements: 39.3_

- [x] 25. Feature completion and deployment
  - Verify all tasks completed
  - Verify all tests passing
  - Verify documentation complete
  - Verify deployment checklist reviewed
  - Feature ready for deployment

---

## Notes

### Task Complexity Reference

- **Simple**: Straightforward code changes, single file modifications
- **Medium**: Changes spanning multiple files, integration of components
- **Complex**: Full feature implementation, multiple system interactions

### Testing Philosophy

- Property-based tests (marked with `*`) validate universal correctness properties
- Unit tests validate specific implementations and edge cases
- Integration tests validate complete workflows and multi-component interactions
- Frontend tests validate UI behavior and user interactions

### Optional Tasks

Test-related sub-tasks marked with `*` are optional and can be skipped for faster MVP delivery. However, property-based tests for core authentication logic are recommended to catch subtle bugs.

### Supabase Integration Points

The backend assumes Supabase client is properly configured. The following operations call Supabase:

1. Create/retrieve user profile on login/signup
2. Update last_login_timestamp on login
3. Create recording with user_id association
4. Query recordings filtered by user_id
5. Delete recordings after ownership verification

The separate Supabase team should complete:
- User_Profile table schema
- Recording table schema with user_id foreign key
- RLS policies for row-level access control

### Time Estimates (per component)

- Backend authentication infrastructure: 4-6 hours
- Google OAuth integration: 6-8 hours
- Recording ownership enforcement: 4-5 hours
- Frontend components: 6-8 hours
- Error handling and security: 3-4 hours
- Testing suite: 8-10 hours
- Documentation and deployment: 2-3 hours

**Total estimated time: 33-44 hours**

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.0", "3.0"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "4.0"] },
    { "id": 2, "tasks": ["5.0", "6.0", "8.0"] },
    { "id": 3, "tasks": ["9.0", "10.0", "11.0"] },
    { "id": 4, "tasks": ["12.0", "12.2", "13.0"] },
    { "id": 5, "tasks": ["14.0", "15.0"] },
    { "id": 6, "tasks": ["16.0", "17.0"] },
    { "id": 7, "tasks": ["18.0", "19.0"] },
    { "id": 8, "tasks": ["20.0", "21.0", "22.0"] },
    { "id": 9, "tasks": ["23.0", "24.0", "25.0"] }
  ]
}
```

**Consolidated Task Summary**:

- **Task 1**: Backend authentication infrastructure setup and JWT implementation (4 subtasks)
- **Task 2**: Backend checkpoint
- **Task 3**: Google OAuth configuration and token exchange (completed)
- **Task 4**: ID token verification and user data extraction (2 subtasks)
- **Task 5**: OAuth callback endpoint and logout (2 subtasks)
- **Task 6**: User profile endpoint (1 subtask)
- **Task 7**: OAuth integration checkpoint
- **Task 8**: Recording upload with user ownership (1 subtask)
- **Task 9**: Recording access control and ownership verification (4 subtasks)
- **Task 10**: Recording ownership checkpoint
- **Task 11**: Frontend authentication context and hooks (2 subtasks)
- **Task 12**: Frontend login and OAuth flow (2 subtasks)
- **Task 13**: Frontend user menu and protected routes (2 subtasks)
- **Task 14**: Frontend API client updates (1 subtask)
- **Task 15**: Frontend components checkpoint
- **Task 16**: Error handling, CORS configuration (3 subtasks)
- **Task 17**: Security checkpoint
- **Task 18**: Core property-based tests (1 comprehensive subtask with 6 properties)
- **Task 19**: Unit tests for authentication services (3 subtasks)
- **Task 20**: Integration tests for authentication flows (4 subtasks)
- **Task 21**: Frontend component tests (1 subtask with 4 test suites)
- **Task 22**: Testing checkpoint
- **Task 23**: Documentation and deployment preparation (2 subtasks)
- **Task 24**: Final integration and comprehensive testing (2 subtasks)
- **Task 25**: Feature completion and deployment

---

## Acceptance Criteria Mapping

This task list covers all requirements defined in the requirements document:

- **Requirement 1**: Google OAuth 2.0 Integration → Tasks 3, 4, 5, 12, 13
- **Requirement 2**: User Login with Google → Tasks 5, 11, 13, 20
- **Requirement 3**: Session Token Generation and Validation → Tasks 1, 2, 18, 19
- **Requirement 4**: Session Storage and Logout → Tasks 1, 5, 18, 19
- **Requirement 5**: User Profile Management → Tasks 6, 11, 23
- **Requirement 6**: Recording Ownership Association → Tasks 8, 9, 18, 20
- **Requirement 7**: Authentication Middleware → Tasks 1, 19
- **Requirement 8**: Frontend Login/Signup UI → Tasks 12, 13, 14, 21
- **Requirement 9**: Error Handling and Edge Cases → Tasks 16, 17, 24
- **Requirement 10**: Security Considerations → Tasks 16, 17
- **Requirement 11**: CORS Configuration → Tasks 16, 24
- **Requirement 12**: Recording Visibility (future) → Tasks 9, 18, 20
- **Requirement 13**: Configuration and Deployment → Tasks 16, 23, 24
- **Requirement 14**: Property-Based Testing → Tasks 18, 19, 20, 21

Each task explicitly references its corresponding requirements for traceability.

---
