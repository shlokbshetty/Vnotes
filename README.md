# VNotes - Voice Notes Application

A modern, production-ready web application for recording, storing, and managing audio and video notes with a clean, intuitive interface.

## Project Overview

VNotes is a full-stack application built with React and Node.js that enables users to:
- Record audio directly from their microphone
- Upload and manage recordings with metadata
- Play back audio and video files
- Organize recordings in a library
- Manage user settings and preferences

## Features

### Core Features
- **Real-time Recording**: Capture audio directly from your microphone with live waveform visualization
- **File Management**: Upload, store, and organize audio and video files
- **Playback**: Built-in audio/video player with standard controls
- **Library System**: Browse all recordings with metadata (size, type, date, duration)
- **Settings Management**: Customize user profile and preferences (saved locally)
- **Help & Documentation**: Comprehensive usage guide and FAQ

### Supported Formats
- **Audio**: WAV, MP3, M4A, AAC, FLAC
- **Video**: MP4, MKV, WebM, AVI, MOV
- **Max File Size**: 500MB per file

##  Architecture

### Project Structure

```
vnotes/
├── backend/                    # Node.js + Express backend
│   ├── src/
│   │   ├── config/            # Configuration management
│   │   │   └── env.ts         # Environment variables
│   │   ├── controllers/       # Request handlers
│   │   │   └── recordingController.ts
│   │   ├── services/          # Business logic
│   │   │   └── recordingService.ts
│   │   ├── routes/            # API endpoints
│   │   │   └── recordingRoutes.ts
│   │   ├── utils/             # Utility functions
│   │   │   ├── logger.ts      # Structured logging
│   │   │   ├── errorHandler.ts
│   │   │   ├── fileUtils.ts
│   │   │   └── syncUploads.ts
│   │   └── server.ts          # Entry point
│   ├── tests/                 # Test suite
│   ├── uploads/               # File storage
│   ├── dist/                  # Compiled output
│   └── package.json
│
├── frontend/                   # React + TypeScript frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── RecordingControls.tsx
│   │   │   ├── RecordingCard.tsx
│   │   │   ├── TranscriptPanel.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── pages/             # Page components
│   │   │   ├── RecordingPage.tsx
│   │   │   ├── LibraryPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── HelpPage.tsx
│   │   ├── services/          # API communication
│   │   │   └── api.ts
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useRecording.ts
│   │   │   └── useRecordings.ts
│   │   ├── utils/             # Utility functions
│   │   │   ├── formatters.ts
│   │   │   └── errorHandler.ts
│   │   ├── types/             # TypeScript definitions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example           # Environment template
│   └── package.json
│
├── scripts/                    # Utility scripts
│   └── preflightCheck.js      # System validation
│
├── .env.example               # Backend env template
├── package.json               # Root package config
└── README.md
```

##  Quick Start

### Prerequisites
- Node.js 14+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd vnotes
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
# Copy example files
cp .env.example .env
cp frontend/.env.example frontend/.env

# Edit .env if needed (optional for local development)
```

4. **Start the application**
```bash
npm run dev
```

This command will:
- Run preflight checks (validates setup)
- Start backend server on `http://localhost:3001`
- Start frontend on `http://localhost:3000`

Both servers run concurrently in development mode.

##  Environment Variables

### Backend (.env)
```env
PORT=3001                          # Server port
NODE_ENV=development               # Environment
CORS_ORIGIN=http://localhost:3000  # Frontend URL
UPLOADS_DIR=uploads                # Upload directory
MAX_FILE_SIZE=524288000            # Max file size (500MB)
ELEVENLABS_API_KEY=your_key_here   # For future transcription
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api  # Backend API URL
VITE_ENABLE_TRANSCRIPTION=false         # Feature flag
```

##  Development

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Run tests
npm run test
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

##  API Endpoints

### Recordings

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/recordings/upload` | Upload audio/video file |
| GET | `/api/recordings` | Get all recordings |
| GET | `/api/recordings/:id` | Get single recording |
| DELETE | `/api/recordings/:id` | Delete recording |
| GET | `/uploads/:filename` | Serve audio/video file |
| GET | `/health` | Health check |

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

##  Testing

### Run API Tests

```bash
cd backend
npm run test
```

Tests verify:
- Health check endpoint
- Recording upload
- Recording retrieval
- Recording deletion
- File serving
- Error handling
- CORS headers

##  Security

### Implemented Measures
-  CORS protection
-  File type validation
-  File size limits (500MB)
-  Input validation
-  Error handling without exposing internals
-  Environment-based configuration

### Future Enhancements
- User authentication
- Authorization checks
- Rate limiting
- Encryption at rest
- Audit logging

##  Deployment

### Build for Production

```bash
# Build both frontend and backend
npm run build

# Or individually
cd backend && npm run build
cd frontend && npm run build
```

### Docker Support (Coming Soon)

```bash
docker-compose up
```

### Cloud Deployment

The application is ready for deployment to:
- Heroku
- AWS (EC2, Elastic Beanstalk)
- Google Cloud Platform
- Azure
- DigitalOcean

Key considerations:
- Use environment variables for configuration
- Ensure uploads directory is persistent
- Configure CORS for your domain
- Use HTTPS in production
- Set up proper logging and monitoring

##  Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is available
# Kill process on port 3001 or change PORT in .env

# Ensure Node.js is installed
node --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Files not uploading
- Check `/backend/uploads/` directory exists
- Verify file format is supported
- Check file size is under 500MB
- Ensure backend is running

### Frontend can't connect to backend
- Verify backend is running on port 3001
- Check VITE_API_URL in frontend/.env
- Check CORS_ORIGIN in backend/.env
- Check browser console for errors

### Preflight check fails
```bash
# Run preflight check manually
node scripts/preflightCheck.js

# It will create missing directories and files
```

##  Performance

- Frontend loads in ~2-3 seconds
- API responses typically <100ms
- Supports concurrent uploads
- Efficient file streaming for playback

##  Data Storage

### Metadata Storage
- Location: `/backend/src/data/recordings.json`
- Format: JSON array of recording objects
- Auto-synced on startup

### File Storage
- Location: `/backend/uploads/`
- Naming: `{timestamp}-{randomId}-{originalname}`
- Cleanup: Delete via API or manually

### Settings Storage
- Location: Browser localStorage
- Format: JSON object
- Scope: Per device/browser

##  UI/UX

- **Design System**: Material Design 3
- **Styling**: Tailwind CSS
- **Icons**: Material Symbols
- **Responsive**: Mobile-first design
- **Accessibility**: WCAG 2.1 compliant

##  Documentation

- [API Documentation](./backend/README.md)
- [Frontend Guide](./frontend/README.md)
- [Testing Guide](./backend/tests/README.md)

##  Status

-  Core recording functionality
-  File management
-  Playback
-  Settings management
-  Transcription (planned)
-  Cloud storage (planned)
-  User authentication (planned)
-  Sharing & collaboration (planned)

##  License

MIT
##  Support

For issues, questions, or suggestions:
1. Check the Help page in the application
2. Review the troubleshooting section above
3. Check existing issues on GitHub
4. Create a new issue with detailed information

##  Acknowledgments

- Built with React, Express, and TypeScript
- Styled with Tailwind CSS
- Icons from Material Symbols

---

**Last Updated**: May 2026
**Version**: 1.0.0

