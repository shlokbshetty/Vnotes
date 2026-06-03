# VNotes - Voice Notes Application

A full-stack web application for recording, storing, and managing audio and video notes with authentication and user-scoped data isolation.

## Overview

VNotes is a production-ready application built with React, Express, and TypeScript that enables users to record audio, upload files, manage recordings, and access them securely with Google OAuth authentication.

### Working Features

Recording Management:
- Record audio directly from microphone
- Upload audio and video files
- Browse and manage recordings in library
- Play back audio and video files
- Delete recordings
- View recording metadata

User Authentication:
- Google OAuth 2.0 login
- Session management with JWT tokens
- User profile management
- Session revocation on logout
- Rate limiting on auth endpoints

Data Management:
- User-scoped recording access control
- Automatic user association with recordings
- JSON-based metadata storage
- Recordings indexed by user

### Supported Formats

Audio: WAV, MP3, M4A, AAC, FLAC
Video: MP4, MKV, WebM, AVI, MOV
Max File Size: 500MB per file

## Architecture

### Modules

Backend (Express + TypeScript):
- src/config/: Environment and OAuth configuration
- src/services/: Business logic (auth, oauth, recordings, transcription)
- src/controllers/: API request handlers
- src/routes/: API endpoint definitions
- src/middlewares/: Authentication and rate limiting
- src/utils/: Utilities (logging, error handling, session store)
- tests/: Unit, integration, and property-based tests

Frontend (React + TypeScript):
- src/pages/: Page components (Recording, Library, Login, Settings)
- src/components/: Reusable UI components
- src/hooks/: Custom React hooks (useRecording, useAuth)
- src/services/: API client and HTTP communication
- src/utils/: Utilities (formatters, error handling)
- src/types/: TypeScript type definitions

### Data Flow

Recording Upload Flow:
User uploads file -> API receives file -> Backend associates user_id -> Stores in /backend/uploads -> Metadata saved to recordings.json

Authentication Flow:
User clicks "Sign in with Google" -> Redirects to Google OAuth -> Google returns authorization code -> Frontend exchanges code for token -> Backend verifies token -> Returns session JWT -> Frontend stores token in localStorage

Recording Access Flow:
User requests recording -> Frontend sends Bearer token in Authorization header -> Backend middleware validates token -> Extracts user_id from JWT -> Filters recordings by user_id -> Returns user's recordings only

### Key Components

API Endpoints:
POST /api/recordings/upload - Upload recording (requires auth)
GET /api/recordings - Get user's recordings (requires auth)
GET /api/recordings/:id - Get single recording (requires auth + ownership)
DELETE /api/recordings/:id - Delete recording (requires auth + ownership)
POST /auth/oauth - OAuth token exchange
POST /auth/logout - Logout and revoke session
GET /api/user/profile - Get user profile (requires auth)

Database Structure:
Recording metadata includes: id, filename, originalName, duration, size, type, userId, isVideo, createdAt
User profile includes: id, googleId, email, name, profilePictureUrl, createdAt, lastLoginAt

## Setup

### Prerequisites

Node.js 16+ and npm
Google Cloud OAuth credentials (for auth feature)
Modern web browser

### Installation

1. Clone and install dependencies:
```bash
git clone <repository-url>
cd vnotes
npm install
```

2. Configure environment:
```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

3. Set up backend environment variables (.env):
```
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
GOOGLE_OAUTH_CLIENT_ID=<your-client-id>
GOOGLE_OAUTH_CLIENT_SECRET=<your-client-secret>
JWT_SECRET=<generate-random-secret-min-32-chars>
JWT_EXPIRATION=86400
UPLOADS_DIR=uploads
MAX_FILE_SIZE=524288000
```

4. Set up frontend environment variables (frontend/.env):
```
VITE_API_URL=http://localhost:3001/api
VITE_GOOGLE_OAUTH_CLIENT_ID=<your-client-id>
```

### Development

Backend:
```bash
cd backend
npm install
npm run dev      # Start with hot reload
npm run build    # Build for production
npm run lint     # Run linter
npm run test     # Run tests
```

Frontend:
```bash
cd frontend
npm install
npm run dev      # Start with hot reload
npm run build    # Build for production
npm run lint     # Run linter
npm run test     # Run tests
```

### Production Build

```bash
npm run build
# Outputs:
# - backend/dist/server.js
# - frontend/dist/ (static files)
```

## API Reference

### Recordings Endpoints

**Upload Recording**
```
POST /api/recordings/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Response:
{
  "success": true,
  "data": {
    "id": "unique-id",
    "filename": "timestamp-randomId-originalname",
    "originalName": "audio.wav",
    "size": 1048576,
    "type": "audio/wav",
    "duration": 30,
    "isVideo": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Get All Recordings**
```
GET /api/recordings
Authorization: Bearer <token>

Response: Array of recording objects for authenticated user
```

**Get Single Recording**
```
GET /api/recordings/:id
Authorization: Bearer <token>

Response: Single recording object (403 if not owner)
```

**Delete Recording**
```
DELETE /api/recordings/:id
Authorization: Bearer <token>

Response: { "success": true } (403 if not owner)
```

### Authentication Endpoints

**OAuth Token Exchange**
```
POST /auth/oauth
Content-Type: application/json

{
  "code": "authorization-code-from-google",
  "state": "csrf-protection-state"
}

Response:
{
  "success": true,
  "data": {
    "token": "jwt-session-token",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "User Name",
      "profilePictureUrl": "https://..."
    }
  }
}
```

**Logout**
```
POST /auth/logout
Authorization: Bearer <token>

Response: { "success": true }
```

**Get User Profile**
```
GET /api/user/profile
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name",
    "profilePictureUrl": "https://..."
  }
}
```

## Testing

### Run Tests

```bash
cd backend
npm run test
```

Tests cover:
- JWT generation, validation, and expiration
- OAuth token exchange and ID token verification
- Session revocation on logout
- Recording ownership enforcement (multi-user scenarios)
- Protected endpoint authorization
- Error handling (400, 401, 403, 500 responses)
- CORS headers and security headers
- Rate limiting on auth endpoints

### Property-Based Testing

Property tests verify core security properties:
- Session tokens are properly structured and signed
- Tampered tokens are rejected
- Expired tokens are rejected
- Users cannot access other users' recordings
- Token revocation prevents reuse

## Deployment

### Docker

```bash
docker-compose up
```

Services:
- Frontend on port 3000
- Backend on port 3001

### Cloud Platforms

Deployable to: Heroku, AWS, Google Cloud, Azure, DigitalOcean

Environment requirements:
- Use environment variables for all secrets
- Ensure uploads directory is persistent
- Configure CORS for your domain
- Use HTTPS in production
- Set up proper logging

## Status

Completed:
- Core recording functionality
- OAuth 2.0 authentication
- User-scoped recording access
- Session management
- Error handling
- Rate limiting
- Comprehensive testing

Planned:
- AI transcription integration
- Cloud storage integration
- Advanced search capabilities
- Recording sharing features

## Support

For issues:
1. Check error logs: npm run dev output
2. Verify environment variables are set
3. Check browser console for frontend errors
4. Review test output: npm run test
5. Check GitHub issues

## License

MIT



