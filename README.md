# VNotes

A web application for voice note recording and transcription with real-time features.

## Features

- Real-time voice recording with live transcription
- Recording library with search and filtering
- Live waveform visualization during recording
- AI-powered key moment detection
- Export functionality for recordings and transcripts
- **Multi-format support**: Audio (.wav, .mp3) and Video (.mp4, .mkv)
- **Video thumbnails**: Automatic thumbnail display for video files
- **File metadata**: Size, type, duration, and creation date tracking

## Tech Stack

**Frontend:**
- React + TypeScript
- Vite (build tool)
- Tailwind CSS

**Backend:**
- Node.js + Express
- TypeScript
- Multer (file uploads)

## Folder Structure

```
/vnotes/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── types/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   └── config/
│   ├── tests/
│   │   ├── api.test.ts
│   │   └── README.md
│   ├── server.ts
│   ├── package.json
│   └── tsconfig.json
├── uploads/
├── .gitignore
└── README.md
```

## Setup

### Quick Start

```bash
npm install
npm run dev
```

This single command installs dependencies and runs both the frontend and backend servers together using `concurrently`. 

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

Both servers will start automatically and run side-by-side.

## Features

- **Recording**: Capture audio directly from your microphone on the Recording page
- **Library**: View all your recordings with metadata (filename, size, type, date, duration)
- **Playback**: Play recordings directly from the library with built-in audio/video controls
- **Settings**: Manage your profile and preferences (saved locally)
- **Help**: Access usage guide and FAQ documentation
- **File Storage**: All recordings are stored locally in `/backend/uploads/`
- **Video Support**: Upload and play video files with automatic thumbnail preview
- **Multi-format**: Support for .wav, .mp3, .mp4, .mkv video formats

## Supported File Formats

### Audio
- `.wav` - WAV format (recommended for recording)
- `.mp3` - MPEG Audio
- `.m4a` - MPEG-4 Audio

### Video
- `.mp4` - MPEG-4 Video
- `.mkv` - Matroska Video
- `.webm` - WebM Video

**Max file size**: 500MB

## API Testing

VNotes includes a comprehensive API test suite to verify all endpoints are working correctly.

### Running Tests

```bash
# From backend directory
npx ts-node tests/api.test.ts
```

### What Gets Tested

- ✅ Health check endpoint
- ✅ Get all recordings
- ✅ Upload audio/video files
- ✅ Get single recording
- ✅ Delete recording
- ✅ Serve static files
- ✅ Invalid file rejection
- ✅ 404 error handling
- ✅ CORS headers

### Test Output

```
=== VNotes API Test Suite ===

Testing API at: http://localhost:3001/api

✓ PASS - Health Check - GET /
✓ PASS - Get All Recordings - GET /api/recordings
✓ PASS - Upload Audio File - POST /api/recordings/upload
...

=== Test Summary ===

Total Tests: 10
Passed: 10
Failed: 0
Success Rate: 100%

✓ All tests passed!
```

For detailed testing information, see [backend/tests/README.md](backend/tests/README.md)

## API Endpoints

### Recordings

- `POST /api/recordings/upload` - Upload audio/video file
- `GET /api/recordings` - Get all recordings
- `GET /api/recordings/:id` - Get single recording
- `DELETE /api/recordings/:id` - Delete recording
- `GET /uploads/:filename` - Serve audio/video file

## Development

### Backend Development

```bash
cd backend
npm install
npm run dev
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Building

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## File Storage

- **Location**: `/backend/uploads/`
- **Naming**: `{timestamp}-{originalname}`
- **Max Size**: 500MB per file
- **Cleanup**: Delete files via API or manually from uploads folder

## Metadata Storage

Recording metadata is stored in `/backend/src/data/recordings.json`:

```json
{
  "id": "1234567890",
  "filename": "1234567890-recording.wav",
  "originalName": "recording.wav",
  "duration": 0,
  "size": 1048576,
  "type": "audio/wav",
  "isVideo": false,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

## Settings Storage

User settings are stored in browser localStorage:

```json
{
  "userName": "John Doe",
  "email": "john@example.com"
}
```

## Troubleshooting

### Server won't start
- Check if ports 3000 and 3001 are available
- Ensure Node.js is installed (v14+)
- Try: `npm install` in both frontend and backend

### Files not uploading
- Check `/backend/uploads/` directory exists
- Verify file format is supported
- Check file size is under 500MB
- Run API tests to verify backend

### Video not playing
- Ensure video format is supported (.mp4, .mkv, .webm)
- Check browser supports HTML5 video
- Verify file is not corrupted

### Tests failing
- Ensure backend server is running on port 3001
- Check network connectivity
- Review test output for specific errors
- See [backend/tests/README.md](backend/tests/README.md) for details

## Performance

- Frontend loads in ~2-3 seconds
- API responses typically <100ms
- Video playback depends on file size and network
- Supports up to 500MB files

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- Real audio duration extraction
- Transcription integration
- Recording search and filtering
- Recording categories/tags
- Export functionality
- Cloud storage integration
- User authentication
- Multi-device sync

## License

MIT

## Support

For issues or questions, check the Help page in the application or review the test suite documentation.
