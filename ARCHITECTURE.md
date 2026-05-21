# VNotes Architecture Documentation

## System Overview

VNotes is a full-stack web application with a clear separation of concerns between frontend and backend, following modern software architecture principles.

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              React Frontend (Port 3000)              │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Pages (Recording, Library, Settings, Help)   │  │   │
│  │  │  Components (RecordingCard, Controls, etc.)    │  │   │
│  │  │  Hooks (useRecording, useRecordings)           │  │   │
│  │  │  Services (API calls)                          │  │   │
│  │  │  Utils (Formatters, Error Handlers)            │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                  Express Backend (Port 3001)                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Routes (API Endpoints)                              │   │
│  │  ├─ POST /api/recordings/upload                      │   │
│  │  ├─ GET /api/recordings                              │   │
│  │  ├─ GET /api/recordings/:id                          │   │
│  │  └─ DELETE /api/recordings/:id                       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Controllers (Request Handlers)                      │   │
│  │  └─ recordingController.ts                           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Services (Business Logic)                           │   │
│  │  └─ recordingService.ts                              │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Utilities & Middleware                              │   │
│  │  ├─ logger.ts (Structured logging)                   │   │
│  │  ├─ errorHandler.ts (Error responses)                │   │
│  │  ├─ fileUtils.ts (File operations)                   │   │
│  │  └─ syncUploads.ts (Metadata sync)                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ File I/O
┌─────────────────────────────────────────────────────────────┐
│                    File System Storage                       │
│  ├─ /backend/uploads/ (Audio/Video files)                   │
│  └─ /backend/src/data/recordings.json (Metadata)            │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Layer Structure

```
Frontend (React + TypeScript)
│
├── Pages Layer
│   ├── RecordingPage.tsx      - Main recording interface
│   ├── LibraryPage.tsx        - Recording library/history
│   ├── SettingsPage.tsx       - User settings
│   └── HelpPage.tsx           - Help & documentation
│
├── Components Layer
│   ├── RecordingControls.tsx  - Recording UI controls
│   ├── RecordingCard.tsx      - Recording display card
│   ├── TranscriptPanel.tsx    - Transcript display
│   └── Sidebar.tsx            - Navigation sidebar
│
├── Hooks Layer (Custom React Hooks)
│   ├── useRecording.ts        - Single recording state
│   └── useRecordings.ts       - Multiple recordings state
│
├── Services Layer
│   └── api.ts                 - API communication
│
├── Utils Layer
│   ├── formatters.ts          - Data formatting
│   └── errorHandler.ts        - Error handling
│
└── Types Layer
    └── index.ts               - TypeScript definitions
```

### Data Flow

```
User Action (e.g., record audio)
    ↓
Component (RecordingPage)
    ↓
Custom Hook (useRecording)
    ↓
Service (apiService)
    ↓
HTTP Request to Backend
    ↓
Response
    ↓
State Update
    ↓
Component Re-render
```

### State Management

- **Local Component State**: React `useState` for UI state
- **Custom Hooks**: `useRecording`, `useRecordings` for business logic
- **Browser Storage**: `localStorage` for user settings
- **API Service**: Centralized API communication

## Backend Architecture

### Layer Structure

```
Backend (Node.js + Express + TypeScript)
│
├── Routes Layer
│   └── recordingRoutes.ts     - API endpoint definitions
│
├── Controllers Layer
│   └── recordingController.ts - Request/response handling
│
├── Services Layer
│   └── recordingService.ts    - Business logic
│
├── Middleware & Utils
│   ├── logger.ts              - Structured logging
│   ├── errorHandler.ts        - Error response formatting
│   ├── fileUtils.ts           - File operations
│   └── syncUploads.ts         - Metadata synchronization
│
├── Config Layer
│   └── env.ts                 - Environment configuration
│
└── Data Layer
    └── recordings.json        - Metadata storage
```

### Request Flow

```
HTTP Request
    ↓
Express Middleware (CORS, JSON parsing)
    ↓
Route Handler (recordingRoutes)
    ↓
Controller (recordingController)
    ↓
Service (recordingService)
    ↓
File System / Data Storage
    ↓
Response (Success or Error)
    ↓
HTTP Response
```

### Error Handling

```
Try-Catch Block
    ↓
Error Caught
    ↓
Logger (logs error with context)
    ↓
Error Handler (formats response)
    ↓
HTTP Response with Error Code
```

## Data Models

### Recording Object

```typescript
interface Recording {
  id: string;                    // Unique identifier
  filename: string;              // Stored filename
  originalName: string;          // Original filename
  duration: number;              // Duration in seconds
  size: number;                  // File size in bytes
  type: string;                  // MIME type
  isVideo: boolean;              // Is video file
  transcription?: string;        // Optional transcription
  createdAt: string;             // ISO timestamp
}
```

### Settings Object

```typescript
interface Settings {
  userName: string;              // User's name
  email: string;                 // User's email
  enableTranscription?: boolean;  // Feature flag
}
```

## API Contract

### Upload Recording

**Request:**
```
POST /api/recordings/upload
Content-Type: multipart/form-data

file: <binary audio/video data>
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "1234567890",
    "filename": "1234567890-recording.wav",
    "originalName": "recording.wav",
    "duration": 0,
    "size": 1048576,
    "type": "audio/wav",
    "isVideo": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Upload failed",
  "code": "UPLOAD_ERROR"
}
```

### Get All Recordings

**Request:**
```
GET /api/recordings
```

**Response:**
```json
{
  "success": true,
  "data": [
    { /* Recording object */ },
    { /* Recording object */ }
  ]
}
```

## Security Architecture

### Input Validation
- File type validation (MIME type checking)
- File size limits (500MB max)
- Filename sanitization

### CORS Protection
- Configurable origin
- Credentials handling
- Preflight request handling

### Error Handling
- No sensitive information in error messages
- Structured error responses
- Proper HTTP status codes

### Environment Configuration
- Secrets in environment variables
- No hardcoded credentials
- Environment-based settings

## Deployment Architecture

### Local Development
```
npm run dev
├─ Backend: ts-node-dev (hot reload)
└─ Frontend: Vite dev server (hot reload)
```

### Production Build
```
npm run build
├─ Backend: TypeScript → JavaScript
└─ Frontend: React → Static HTML/CSS/JS
```

### Docker Deployment
```
docker-compose up
├─ Backend Container (Node.js)
├─ Frontend Container (Node.js + serve)
└─ Shared volumes (uploads)
```

### Cloud Deployment
- Environment variables for configuration
- Persistent storage for uploads
- Health checks for monitoring
- Proper logging and error tracking

## Performance Considerations

### Frontend
- Component memoization where needed
- Lazy loading for routes
- Efficient state management
- Minimal re-renders

### Backend
- Streaming for file uploads/downloads
- Efficient file I/O
- Connection pooling (future)
- Caching strategies (future)

### Network
- Gzip compression
- HTTP/2 support
- CDN ready (future)
- API response optimization

## Scalability Roadmap

### Phase 1 (Current)
- Single server deployment
- Local file storage
- JSON metadata storage

### Phase 2 (Planned)
- Database integration (MongoDB/PostgreSQL)
- User authentication
- Cloud storage (S3/GCS)
- Transcription service

### Phase 3 (Future)
- Microservices architecture
- Message queue (RabbitMQ/Kafka)
- Caching layer (Redis)
- Load balancing
- Multi-region deployment

## Testing Strategy

### Unit Tests
- Service layer logic
- Utility functions
- Error handling

### Integration Tests
- API endpoints
- File upload/download
- Metadata operations

### E2E Tests (Future)
- User workflows
- Recording lifecycle
- Error scenarios

## Monitoring & Logging

### Structured Logging
```
[timestamp] [level] message { context }
[2024-01-15T10:30:00.000Z] [INFO] Recording uploaded { id: "123", size: 1048576 }
```

### Health Checks
- Backend: `/health` endpoint
- Frontend: Page load verification
- Docker: Container health checks

### Error Tracking (Future)
- Sentry integration
- Error aggregation
- Performance monitoring

## Development Workflow

### Code Organization
- Clear separation of concerns
- Single responsibility principle
- DRY (Don't Repeat Yourself)
- Consistent naming conventions

### Code Quality
- ESLint for linting
- TypeScript for type safety
- Prettier for formatting
- Pre-commit hooks (future)

### Version Control
- Feature branches
- Pull request reviews
- Semantic versioning
- Changelog maintenance

## Future Enhancements

### Features
- Real-time transcription
- Recording search
- Tags and categories
- Sharing and collaboration
- Export functionality

### Infrastructure
- Database integration
- Cloud storage
- CDN integration
- API rate limiting
- Advanced caching

### Developer Experience
- API documentation (Swagger)
- GraphQL support
- WebSocket for real-time updates
- Better error messages
- Development tools

---

**Last Updated**: May 2026
**Architecture Version**: 1.0.0
