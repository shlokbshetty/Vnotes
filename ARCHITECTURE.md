# VNotes Architecture

System design and module structure for VNotes application.

## System Overview

VNotes is a full-stack application separating frontend and backend concerns.

Frontend (React):
- Handles UI rendering
- Manages user state
- Communicates with backend via HTTP API
- Stores session tokens in localStorage

Backend (Express + Node.js):
- Receives and validates HTTP requests
- Processes business logic
- Manages authentication
- Stores data and files

Stores:
- File storage: /backend/uploads/
- Metadata storage: JSON files

## Frontend Architecture

Pages:
- RecordingPage: Main recording interface
- LibraryPage: Recordings library and history
- SettingsPage: User settings
- HelpPage: Help and FAQ
- LoginPage: Authentication

Components:
- RecordingControls: Recording UI controls
- RecordingCard: Recording display
- TranscriptPanel: Transcript display
- Sidebar: Navigation
- UserMenu: User profile and logout
- ProtectedRoute: Route protection

Hooks (State Management):
- useRecording: Single recording state
- useRecordings: Multiple recordings state
- useAuth: Authentication state

Services:
- api.ts: API communication with backend

Utilities:
- formatters.ts: Data formatting
- errorHandler.ts: Error handling

## Backend Architecture

Routes:
- recordingRoutes.ts: Recording endpoints
- authRoutes.ts: Authentication endpoints
- userRoutes.ts: User profile endpoints

Controllers:
- recordingController.ts: Request handlers

Services (Business Logic):
- authService.ts: JWT generation and validation
- oauthService.ts: Google OAuth handling
- recordingService.ts: Recording operations
- transcriptionService.ts: Audio transcription

Middleware:
- authMiddleware.ts: Token validation
- rateLimiter.ts: Request rate limiting

Configuration:
- env.ts: Environment variables
- oauth.ts: OAuth configuration

Utilities:
- logger.ts: Structured logging
- errorHandler.ts: Error response formatting
- fileUtils.ts: File operations
- sessionStore.ts: Session revocation tracking

## API Endpoints

Recording Management:
- POST /api/recordings/upload - Upload recording
- GET /api/recordings - Get user's recordings
- GET /api/recordings/:id - Get specific recording
- DELETE /api/recordings/:id - Delete recording

Authentication:
- POST /auth/oauth - OAuth token exchange
- POST /auth/logout - Logout and revoke token
- GET /api/user/profile - Get user profile

## Data Models

Recording:
{
  "id": "unique-id",
  "filename": "timestamp-randomId-name",
  "originalName": "original.wav",
  "duration": 30,
  "size": 1048576,
  "type": "audio/wav",
  "isVideo": false,
  "userId": "user-uuid",
  "createdAt": "2024-01-15T10:30:00.000Z"
}

User Profile:
{
  "id": "user-uuid",
  "googleId": "google-subject",
  "email": "user@example.com",
  "name": "User Name",
  "profilePictureUrl": "https://...",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "lastLoginAt": "2024-01-15T10:30:00.000Z"
}

## Request Flow

Recording Upload:
1. User uploads file from frontend
2. Frontend sends multipart/form-data to POST /api/recordings/upload
3. Frontend includes Authorization header with Bearer token
4. Backend receives file
5. Backend validates Bearer token
6. Backend extracts user_id from JWT claims
7. Backend stores file in /uploads/
8. Backend saves metadata with user_id to recordings.json
9. Backend returns recording object

Recording Retrieval:
1. Frontend requests GET /api/recordings
2. Frontend includes Bearer token
3. Backend validates token
4. Backend filters recordings by user_id
5. Backend returns array of user's recordings

Authentication:
1. Frontend receives Google authorization code
2. Frontend sends POST /auth/oauth with code
3. Backend exchanges code for Google ID token
4. Backend verifies ID token signature
5. Backend extracts user data from ID token
6. Backend creates session JWT
7. Backend returns session token to frontend
8. Frontend stores token in localStorage

## Security

Authentication:
- Google OAuth 2.0 for user authentication
- JWT tokens for session management
- Tokens signed with HS256 algorithm
- 24-hour token expiration
- Tokens revoked immediately on logout

Authorization:
- Bearer token required on all protected endpoints
- user_id extracted from JWT claims
- Recording access restricted to owner (403 if not owner)

CORS:
- CORS_ORIGIN from environment
- Credentials allowed (Authorization header)
- Preflight OPTIONS requests handled

Headers:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block

Rate Limiting:
- POST /auth/oauth: 5 requests per 5 minutes per IP
- POST /auth/logout: 10 requests per hour per IP
- Returns 429 Too Many Requests when exceeded

Input Validation:
- File type validation (MIME types)
- File size limits (500MB max)
- Filename sanitization

Error Handling:
- 400 Bad Request for malformed requests
- 401 Unauthorized for missing/invalid authentication
- 403 Forbidden for permission violations
- 500 Internal Server Error for server issues
- Error responses don't expose sensitive data

## File Storage

Location: /backend/uploads/

File Naming: {timestamp}-{randomId}-{originalname}

Structure:
- All user uploads stored together
- .gitkeep file for folder tracking
- Upload folder in .gitignore (files not tracked)

Cleanup:
- Delete via DELETE /api/recordings/:id endpoint
- Files deleted when recording metadata removed

## Metadata Storage

Location: /backend/src/data/recordings.json

Format: JSON array of recording objects

Structure:
{
  "recordings": [
    { recording object 1 },
    { recording object 2 },
    ...
  ]
}

Sync:
- Auto-synced on backend startup
- Updated on recording operations
- Persisted after each operation

## Deployment

Local Development:
- npm run dev starts both frontend and backend
- Hot reload enabled for both
- Connects to local backend API

Production Build:
- npm run build compiles both frontend and backend
- Outputs:
  - backend/dist/server.js
  - frontend/dist/ (static files)
- Separate deployment for each

Docker:
- docker-compose up runs both services
- Services communicate on private network
- Persistent volumes for uploads and data

Cloud Platforms:
- Environment variables for configuration
- Persistent storage for uploads/data
- Horizontal scaling with load balancer
- CDN for static frontend files

## Performance

Frontend:
- React component memoization
- Lazy route loading
- Minimal re-renders

Backend:
- Streaming for file operations
- Efficient file I/O
- Direct filesystem storage

Network:
- Gzip compression
- HTTP/2 support
- CDN ready

## Scalability Considerations

Current (Single Server):
- All services on single server
- Local file storage
- JSON metadata storage
- Suitable for development and small deployments

Future (Multiple Servers):
- Load balancer to distribute requests
- Database (MongoDB/PostgreSQL) for user and recording data
- Cloud storage (S3/GCS) for files
- Redis cache for session data
- Message queue for async operations

## Testing

Unit Tests:
- Service layer logic
- Utility functions
- JWT operations
- OAuth handling

Integration Tests:
- Complete user flows
- Multi-user scenarios
- Recording ownership verification

Property-Based Tests:
- Session token properties
- Authorization properties
- Ownership enforcement properties

Frontend Tests:
- Component rendering
- User interaction
- Auth flow

## Development Workflow

Branches:
- main: Production-ready code
- feature branches: Development branches

Commits:
- Semantic commit messages
- Related changes grouped

Code Quality:
- ESLint for linting
- TypeScript for type safety
- Prettier for formatting
- Pre-commit hooks recommended

## Documentation

README.md: Overview and setup
ARCHITECTURE.md: This document
GOOGLE_AUTH_SETUP.md: Authentication setup
GOOGLE_AUTH_DEPLOYMENT_CHECKLIST.md: Deployment verification
SETUP_ELEVENLABS.md: Transcription setup
DEPLOYMENT.md: Cloud deployment guides
API_AUTH_DOCUMENTATION.md: API endpoint details

## Status

Completed:
- Core recording functionality
- OAuth 2.0 authentication
- User-scoped recording access
- Session management
- Error handling
- Rate limiting

Planned:
- AI transcription
- Cloud storage integration
- Advanced search
- Recording sharing
