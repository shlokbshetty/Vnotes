# Implementation Plan: Google Authentication Feature

## Overview

This implementation plan breaks down the Google OAuth 2.0 authentication feature into discrete, actionable coding tasks. The plan follows the authorization code flow architecture defined in the design document, with separate phases for frontend UI, backend API infrastructure, OAuth integration, session management, recording ownership enforcement, error handling, and comprehensive testing.

Each task builds incrementally, starting with authentication infrastructure and middleware, then implementing frontend UI components, followed by recording ownership enforcement, and finally comprehensive testing including property-based tests for core correctness properties.

---

## Tasks

### Phase 1: Backend Authentication Infrastructure

- [ ] 1. Set up backend authentication project structure and utilities
  - Create `/src/services/authService.ts` for JWT generation and validation
  - Create `/src/middlewares/authMiddleware.ts` for request authentication
  - Create `/src/utils/sessionStore.ts` for session revocation tracking (in-memory)
  - Create `/src/types/auth.ts` with TypeScript interfaces for auth types
  - Add JWT and Google OAuth dependencies (jsonwebtoken, google-auth-library)
  - _Requirements: 3.1, 3.2, 7.1, 10.3_

- [ ] 2. Implement JWT session token generation
  - [ ] 2.1 Create JWT signing utility with configurable expiration
    - Generate tokens with required claims (sub, user_id, email)
    - Use HMAC-SHA256 with JWT_SECRET from environment
    - Include iat and exp timestamps
    - _Requirements: 3.1, 3.2, 10.3_
  
  - [ ]* 2.2 Write property test for JWT generation
    - **Property 1: Session Token Structure and Signing**
    - **Validates: Requirements 3.1, 3.2**
    - Test that generated tokens are valid JWTs with correct claims
    - Verify tokens can be decoded without verification errors
    - Test with various user data inputs
  
  - [ ] 2.3 Create JWT validation utility
    - Verify token signature against JWT_SECRET
    - Check token expiration
    - Validate claims structure
    - _Requirements: 3.3, 3.4_

- [ ] 3. Implement authentication middleware
  - [ ] 3.1 Create middleware for Bearer token extraction and validation
    - Extract Authorization header
    - Parse Bearer token format
    - Reject malformed headers with 400 Bad Request
    - Validate token and extract user_id
    - Attach user_id to request context (req.userId)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  
  - [ ]* 3.2 Write property test for protected endpoint authorization
    - **Property 5: Protected Endpoint Authorization**
    - **Validates: Requirements 7.1, 7.2**
    - Test requests without Authorization header return 401
    - Test requests with invalid tokens return 401
    - Test requests with valid tokens allow passage
    - Test malformed Bearer tokens return 400
  
  - [ ] 3.3 Integrate middleware into protected recording routes
    - Apply authMiddleware to GET /api/recordings
    - Apply authMiddleware to GET /api/recordings/:id
    - Apply authMiddleware to POST /api/recordings/upload
    - Apply authMiddleware to DELETE /api/recordings/:id
    - _Requirements: 7.1, 7.8, 7.9, 7.10_

- [ ] 4. Create session store and revocation logic
  - [ ] 4.1 Implement in-memory session revocation store
    - Store revoked token identifiers
    - Track revocation timestamps
    - _Requirements: 4.2, 4.8_
  
  - [ ] 4.2 Implement session revocation check in validation
    - Query revocation store when validating tokens
    - Return 401 Unauthorized for revoked tokens
    - _Requirements: 4.6_

- [ ] 5. Checkpoint - Verify authentication middleware
  - Ensure authentication middleware properly validates tokens
  - Ensure protected endpoints are protected
  - Run unit tests for auth service, middleware, and JWT functions
  - Ask user if questions arise

### Phase 2: Google OAuth Integration

- [ ] 6. Implement Google OAuth configuration and setup
  - [ ] 6.1 Create OAuth configuration module
    - Load GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET from env
    - Configure Google OAuth endpoints
    - Initialize Google Auth library
    - _Requirements: 13.1, 13.2, 13.4_
  
  - [ ] 6.2 Create Google token exchange utility
    - Implement authorization code to token exchange
    - Call Google token endpoint
    - Handle token exchange errors
    - _Requirements: 1.2, 1.3, 2.1, 2.2_

- [ ] 7. Implement ID token verification and user data extraction
  - [ ] 7.1 Create ID token signature verification utility
    - Fetch Google's public JWKS keys
    - Verify ID token signature
    - Validate token issuer and expiration
    - _Requirements: 1.4, 1.5, 1.6_
  
  - [ ]* 7.2 Write property test for ID token verification
    - **Property 3: ID Token Signature Verification**
    - **Validates: Requirements 1.3, 1.4, 1.5**
    - Generate mock Google ID tokens with valid and invalid signatures
    - Verify valid tokens pass verification
    - Verify tampered tokens are rejected
    - Verify expired tokens are rejected
  
  - [ ] 7.3 Extract user profile data from ID token
    - Extract email, name, profile picture URL from token claims
    - Extract Google subject identifier (sub)
    - Handle missing or malformed claims with error responses
    - _Requirements: 1.5, 5.1_

- [ ] 8. Create OAuth callback API endpoint
  - [ ] 8.1 Implement POST /auth/oauth endpoint
    - Accept authorization code from frontend
    - Exchange code for Google tokens
    - Verify ID token signature
    - Extract user data (email, name, picture, google_id)
    - Call Supabase to create/update user profile
    - Generate session JWT
    - Return session token and user data
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 3.0_
  
  - [ ] 8.2 Handle OAuth errors appropriately
    - Return 400 for invalid/expired authorization code
    - Return 401 for ID token verification failure
    - Return 500 for database/Supabase errors
    - Log errors with context without exposing sensitive data
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 9. Implement logout endpoint
  - [ ] 9.1 Create POST /auth/logout endpoint
    - Require valid session token
    - Add token to revocation store
    - Return 200 OK response
    - _Requirements: 4.1, 4.2, 4.3, 4.8_
  
  - [ ] 9.2 Handle logout errors
    - Return 401 for invalid/missing tokens
    - Handle session store failures gracefully
    - _Requirements: 4.7, 9.7_

- [ ] 10. Create user profile endpoint
  - [ ] 10.1 Implement GET /api/user/profile endpoint
    - Require valid session token
    - Query Supabase for authenticated user's profile
    - Return profile data (exclude sensitive data)
    - _Requirements: 5.2, 5.4_
  
  - [ ] 10.2 Handle profile retrieval errors
    - Return 401 for invalid token
    - Return 500 for Supabase errors (with safe error message)
    - _Requirements: 5.5, 9.5_

- [ ] 11. Checkpoint - Verify OAuth integration
  - Test OAuth redirect and callback flow with mock Google responses
  - Verify session tokens are generated correctly
  - Run integration tests for auth endpoints
  - Ask user if questions arise

### Phase 3: Recording Ownership Enforcement

- [ ] 12. Update recording upload to associate user ownership
  - [ ] 12.1 Modify recording upload endpoint to capture user_id
    - Extract user_id from authenticated request (req.userId from middleware)
    - Add user_id to recording metadata
    - Store user_id in Supabase recording entry
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ] 12.2 Ensure user_id is included in file metadata
    - Update recordingService to include user_id in metadata
    - Pass user_id through to Supabase insert call
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 13. Implement recording access control
  - [ ] 13.1 Add user_id filtering to GET /api/recordings
    - Extract user_id from session token
    - Query Supabase for recordings matching user_id only
    - Return only user's own recordings
    - _Requirements: 6.5_
  
  - [ ]* 13.2 Write property test for recording ownership enforcement
    - **Property 4: Recording Ownership Enforcement**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
    - Create recordings from multiple users in test database
    - Verify each user can only query their own recordings
    - Verify cross-user queries return empty results
    - Verify unauthorized user_ids cannot be spoofed from client

- [ ] 14. Implement recording retrieval access control
  - [ ] 14.1 Add ownership verification to GET /api/recordings/:id
    - Extract user_id from session token
    - Query recording from Supabase with both id and user_id filter
    - Return 403 Forbidden if recording belongs to different user
    - Return 404 if recording not found or filtered out
    - _Requirements: 6.5, 6.6_

- [ ] 15. Implement recording deletion access control
  - [ ] 15.1 Add ownership verification to DELETE /api/recordings/:id
    - Extract user_id from session token
    - Verify recording's user_id matches authenticated user (from Supabase query)
    - Return 403 Forbidden if ownership verification fails
    - Delete recording file and metadata only after verification
    - _Requirements: 6.7, 6.8, 6.9_
  
  - [ ] 15.2 Ensure deletion cleans up both file and database entry
    - Delete audio file from uploads directory
    - Delete metadata from Supabase
    - Handle both failures gracefully

- [ ] 16. Checkpoint - Verify recording ownership enforcement
  - Test recording upload includes user_id
  - Test user cannot access other user's recordings
  - Test user cannot delete other user's recordings
  - Run integration tests with multi-user scenarios
  - Ask user if questions arise

### Phase 4: Frontend Authentication UI Components

- [ ] 17. Create authentication types and context
  - [ ] 17.1 Define TypeScript interfaces for auth context
    - User interface (user_id, email, name, profile_picture_url)
    - Auth context interface with login/logout methods
    - Session token storage interface
    - _Requirements: 8.7, 8.8_

- [ ] 18. Implement AuthContext and useAuth hook
  - [ ] 18.1 Create React Context for authentication state
    - Manage current user state
    - Manage session token state
    - Provide login and logout methods
    - Handle localStorage persistence
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 18.2 Create useAuth custom hook
    - Provide easy access to auth context
    - Handle context not being available gracefully
    - _Requirements: 8.3_

- [ ] 19. Create LoginPage component
  - [ ] 19.1 Build LoginPage UI with Google auth button
    - Display "Sign Up / Log In with Google" button
    - Show loading state during OAuth flow
    - Display error messages if OAuth fails
    - _Requirements: 8.1, 8.2, 8.6_
  
  - [ ] 19.2 Implement Google OAuth popup/redirect flow
    - Generate OAuth state parameter (CSRF protection)
    - Build Google authorization URL with client ID, scopes, redirect URI
    - Initiate OAuth popup or redirect
    - _Requirements: 1.1, 2.1_

- [ ] 20. Create OAuth callback handler
  - [ ] 20.1 Implement GoogleAuthCallback component
    - Extract authorization code from URL query params
    - Extract state parameter and verify CSRF protection
    - Send code to backend POST /auth/oauth
    - _Requirements: 1.2_
  
  - [ ] 20.2 Handle successful OAuth callback
    - Receive session token from backend
    - Store token in localStorage
    - Update auth context with user data
    - Redirect to dashboard/library page
    - _Requirements: 1.9, 1.10_
  
  - [ ] 20.3 Handle OAuth callback errors
    - Display user-friendly error message
    - Redirect to login page on error
    - Handle user cancellation gracefully
    - _Requirements: 8.5, 8.6, 9.8_

- [ ] 21. Create UserMenu component
  - [ ] 21.1 Build UserMenu UI with profile display
    - Display user's profile picture
    - Display user's name
    - Show dropdown menu on click
    - Display "Logout" option in menu
    - _Requirements: 8.7, 8.8_
  
  - [ ] 21.2 Implement logout functionality
    - Send logout request to backend
    - Remove session token from localStorage
    - Clear auth context
    - Redirect to login page
    - _Requirements: 4.1, 8.9, 8.10_

- [ ] 22. Create ProtectedRoute component
  - [ ] 22.1 Implement route protection wrapper
    - Check if user is authenticated (token in context)
    - Redirect to login if unauthenticated
    - Render component if authenticated
    - _Requirements: 3.10_
  
  - [ ] 22.2 Integrate ProtectedRoute into app routing
    - Wrap recording page with ProtectedRoute
    - Wrap library page with ProtectedRoute
    - Wrap settings page with ProtectedRoute
    - Wrap user profile page with ProtectedRoute

- [ ] 23. Update API client with authorization header
  - [ ] 23.1 Modify API service to include Bearer token
    - Extract token from localStorage
    - Add Authorization header to all API requests
    - Handle 401 responses by redirecting to login
    - _Requirements: 3.9, 3.10_
  
  - [ ] 23.2 Implement session expiration handling
    - Detect 401 responses indicating expired session
    - Display "Session expired" message to user
    - Redirect to login page
    - _Requirements: 9.10_

- [ ] 24. Checkpoint - Verify frontend UI components
  - Test LoginPage renders and OAuth flow initiates
  - Test GoogleAuthCallback receives code and exchanges for token
  - Test UserMenu displays when authenticated
  - Test ProtectedRoute redirects unauthenticated users
  - Run unit tests for React components using React Testing Library
  - Ask user if questions arise

### Phase 5: Error Handling and Security Configuration

- [ ] 25. Implement comprehensive error handling
  - [ ] 25.1 Add error handling to POST /auth/oauth
    - Catch and handle Google token exchange failures
    - Catch and handle ID token verification failures
    - Catch and handle Supabase user profile errors
    - Return appropriate HTTP status codes and messages
    - Log errors without exposing sensitive data
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
  
  - [ ] 25.2 Add error handling to protected endpoints
    - Gracefully handle missing Supabase responses
    - Handle recording query failures
    - Return 500 with safe error messages
    - _Requirements: 9.5_

- [ ] 26. Configure CORS for authentication
  - [ ] 26.1 Update CORS configuration in Express
    - Set CORS origin from CORS_ORIGIN environment variable
    - Allow credentials (Authorization headers)
    - Include Authorization in Access-Control-Allow-Headers
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [ ] 26.2 Add security headers to responses
    - Add X-Content-Type-Options: nosniff
    - Add X-Frame-Options: DENY
    - Add X-XSS-Protection: 1; mode=block
    - _Requirements: 10.1_

- [ ] 27. Implement rate limiting for auth endpoints
  - [ ] 27.1 Add rate limiting middleware
    - Limit /auth/oauth to 5 attempts per IP per 5 minutes
    - Limit /auth/logout to 10 attempts per IP per hour
    - Return 429 Too Many Requests when limit exceeded
    - _Requirements: 10.10_

- [ ] 28. Configure environment variables
  - [ ] 28.1 Add authentication environment variables to backend .env
    - GOOGLE_OAUTH_CLIENT_ID
    - GOOGLE_OAUTH_CLIENT_SECRET
    - GOOGLE_OAUTH_CALLBACK_URI
    - JWT_SECRET (generate strong 256-bit key)
    - JWT_EXPIRATION (default 86400)
    - CORS_ORIGIN
    - SUPABASE_URL
    - SUPABASE_ANON_KEY
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [ ] 28.2 Add authentication environment variables to frontend .env
    - VITE_GOOGLE_OAUTH_CLIENT_ID
    - VITE_BACKEND_URL
    - _Requirements: 13.1_
  
  - [ ] 28.3 Update .env.example with all required variables
    - Include placeholders and explanatory comments
    - Document each variable's purpose and format
    - _Requirements: 13.8_

- [ ] 29. Checkpoint - Verify error handling and security
  - Test error responses with various failure scenarios
  - Verify CORS headers are present in responses
  - Test rate limiting on auth endpoints
  - Verify environment variables are properly loaded
  - Ask user if questions arise

### Phase 6: Property-Based Testing and Test Suite

- [ ] 30. Write property-based tests for core authentication logic
  - [ ] 30.1 Create test suite for JWT generation and validation
    - **Property 1: Session Token Structure and Signing**
    - **Property 2: Session Token Validation and Claim Extraction**
    - Generate random user data
    - Create multiple tokens with different claims
    - Verify all tokens are structurally valid
    - Verify claims can be extracted correctly
    - _Requirements: 14.1, 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 30.2 Write property test for ID token verification
    - **Property 3: ID Token Signature Verification**
    - Generate valid Google ID tokens with test keys
    - Generate tampered/invalid tokens
    - Verify signature verification catches all invalid cases
    - Test expiration checking works for all tokens
    - _Requirements: 14.1, 1.4, 1.5_
  
  - [ ] 30.3 Write property test for recording ownership
    - **Property 4: Recording Ownership Enforcement**
    - Create recordings from N different users
    - For each user, verify they can only query own recordings
    - For each pair of different users, verify cross-access fails
    - Verify delete operations fail for non-owners
    - _Requirements: 14.1, 6.1, 6.2, 6.3, 6.4_
  
  - [ ] 30.4 Write property test for protected endpoints
    - **Property 5: Protected Endpoint Authorization**
    - Test with missing Authorization header
    - Test with malformed Bearer tokens
    - Test with expired tokens
    - Test with invalid signatures
    - Verify all return appropriate 4xx responses
    - _Requirements: 14.1, 7.1, 7.2_
  
  - [ ] 30.5 Write property test for session revocation
    - **Property 6: Session Token Revocation on Logout**
    - Create valid token
    - Call logout endpoint to revoke
    - Verify token cannot be used for API calls after revocation
    - Verify new login creates different valid token
    - _Requirements: 14.1, 4.2, 4.3, 4.6_

- [ ] 31. Write unit tests for authentication services
  - [ ] 31.1 Unit tests for JWT service
    - Test token generation with valid inputs
    - Test token validation with valid/invalid tokens
    - Test expiration checking
    - Test claim extraction
  
  - [ ] 31.2 Unit tests for OAuth service
    - Mock Google token exchange endpoint
    - Test successful token exchange
    - Test error handling for failed exchanges
    - Test ID token extraction
  
  - [ ] 31.3 Unit tests for session store
    - Test token revocation storage
    - Test revocation lookup
    - Test session expiration

- [ ] 32. Write integration tests for authentication flow
  - [ ] 32.1 Test complete OAuth signup flow
    - Send authorization code to /auth/oauth
    - Verify user profile is created in Supabase (mocked)
    - Verify session token is returned
    - Verify token can be used for API calls
  
  - [ ] 32.2 Test complete OAuth login flow
    - Send authorization code for existing user
    - Verify last_login_timestamp is updated
    - Verify session token is returned
    - Verify token works for API calls
  
  - [ ] 32.3 Test logout flow
    - Login to get token
    - Call logout endpoint
    - Verify token is revoked
    - Verify API calls with token fail with 401

- [ ] 33. Write integration tests for recording ownership
  - [ ] 33.1 Test multi-user recording scenarios
    - User A uploads recording
    - User B attempts to access recording (should fail)
    - User A can access and delete recording
    - User A deletes recording
    - Recording is no longer accessible
  
  - [ ] 33.2 Test recording metadata includes user_id
    - Upload recording as authenticated user
    - Query recording from Supabase
    - Verify user_id matches authenticated user

- [ ] 34. Write frontend component tests
  - [ ] 34.1 Unit tests for LoginPage component
    - Test Google button renders
    - Test OAuth state generation
    - Test click handler initiates OAuth flow
  
  - [ ] 34.2 Unit tests for GoogleAuthCallback component
    - Test URL parameter extraction
    - Test state parameter verification
    - Test backend API call
    - Test token storage and redirect
  
  - [ ] 34.3 Unit tests for UserMenu component
    - Test renders only when authenticated
    - Test displays user info
    - Test logout button functionality
  
  - [ ] 34.4 Unit tests for ProtectedRoute component
    - Test renders component when authenticated
    - Test redirects when unauthenticated
    - Test token expiration handling

- [ ] 35. Checkpoint - Verify all tests pass
  - Run unit test suite (80%+ coverage of auth logic)
  - Run property-based tests for core properties
  - Run integration tests for complete flows
  - Run frontend component tests
  - Ask user if questions arise

### Phase 7: Documentation and Final Integration

- [ ] 36. Document authentication API endpoints
  - [ ] 36.1 Create API documentation
    - Document POST /auth/oauth endpoint
    - Document POST /auth/logout endpoint
    - Document GET /api/user/profile endpoint
    - Include request/response examples
    - Document error responses

- [ ] 37. Document environment configuration
  - [ ] 37.1 Create setup guide for developers
    - Document required environment variables
    - Document how to set up Google OAuth app
    - Document JWT secret generation
    - Document local development setup

- [ ] 38. Create deployment checklist
  - [ ] 38.1 Document pre-deployment requirements
    - Generate production JWT secret
    - Register production Google OAuth app
    - Configure production CORS origin
    - Set all environment variables
    - Enable HTTPS in production

- [ ] 39. Final integration and verification
  - [ ] 39.1 Verify all authentication components work together
    - Test complete user flow: login → access recording → logout
    - Test multi-user scenarios
    - Test error cases and recovery
  
  - [ ] 39.2 Verify CORS configuration allows frontend-backend communication
    - Test preflight OPTIONS requests
    - Test actual API calls with Authorization header
  
  - [ ] 39.3 Run full test suite
    - All unit tests passing
    - All integration tests passing
    - All property-based tests passing
    - Frontend tests passing

- [ ] 40. Final checkpoint - Complete authentication feature
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
    { "id": 0, "tasks": ["1.0", "4.0", "17.0", "28.1", "28.2"] },
    { "id": 1, "tasks": ["2.1", "2.3", "3.1", "6.1", "6.2"] },
    { "id": 2, "tasks": ["2.2", "3.2", "3.3", "7.1", "7.3", "26.1"] },
    { "id": 3, "tasks": ["7.2", "8.1", "8.2", "9.1", "9.2"] },
    { "id": 4, "tasks": ["10.1", "10.2", "19.1", "19.2", "20.1"] },
    { "id": 5, "tasks": ["20.2", "20.3", "18.1", "18.2", "21.1"] },
    { "id": 6, "tasks": ["21.2", "22.1", "22.2", "23.1", "23.2"] },
    { "id": 7, "tasks": ["12.1", "12.2", "13.1", "27.1", "28.3"] },
    { "id": 8, "tasks": ["13.2", "14.1", "15.1", "15.2", "25.1"] },
    { "id": 9, "tasks": ["25.2", "26.2", "30.1", "30.2", "30.3"] },
    { "id": 10, "tasks": ["30.4", "30.5", "31.1", "31.2", "31.3"] },
    { "id": 11, "tasks": ["32.1", "32.2", "32.3", "33.1", "33.2"] },
    { "id": 12, "tasks": ["34.1", "34.2", "34.3", "34.4", "36.1"] },
    { "id": 13, "tasks": ["37.1", "38.1", "39.1", "39.2", "39.3"] }
  ]
}
```

---

## Acceptance Criteria Mapping

This task list covers all requirements defined in the requirements document:

- **Requirement 1**: Google OAuth 2.0 Integration → Tasks 6, 7, 8, 19, 20
- **Requirement 2**: User Login with Google → Tasks 8, 18, 20, 32.2
- **Requirement 3**: Session Token Generation and Validation → Tasks 2, 3, 30.1, 30.2
- **Requirement 4**: Session Storage and Logout → Tasks 4, 9, 30.5
- **Requirement 5**: User Profile Management → Tasks 10, 18, 37
- **Requirement 6**: Recording Ownership Association → Tasks 12, 13, 14, 15, 30.3, 33
- **Requirement 7**: Authentication Middleware → Tasks 3, 31.2
- **Requirement 8**: Frontend Login/Signup UI → Tasks 19, 20, 21, 22, 34
- **Requirement 9**: Error Handling and Edge Cases → Tasks 25, 26, 28, 35
- **Requirement 10**: Security Considerations → Tasks 26, 27, 28
- **Requirement 11**: CORS Configuration → Tasks 26, 39.2
- **Requirement 12**: Recording Visibility (future) → Tasks 30.3, 33
- **Requirement 13**: Configuration and Deployment → Tasks 28, 36, 37, 38
- **Requirement 14**: Property-Based Testing → Tasks 30, 31, 32, 33

Each task explicitly references its corresponding requirements for traceability.

---
