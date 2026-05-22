# VNotes Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Node.js 14+ installed
- npm installed

### Step 1: Clone & Install

```bash
git clone <repository-url>
cd vnotes
npm install
```

### Step 2: Setup Environment (Optional)

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

### Step 3: Run Preflight Check

```bash
npm run predev
```

This will:
- ✅ Verify backend is running
- ✅ Create uploads folder if missing
- ✅ Create recordings.json if missing
- ✅ Show clear error messages if anything fails

### Step 4: Start Development

```bash
npm run dev
```

Both servers start automatically:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

---

## 📋 Common Commands

### Development

```bash
# Start both servers
npm run dev

# Start only backend
cd backend && npm run dev

# Start only frontend
cd frontend && npm run dev

# Run linter
cd backend && npm run lint
cd frontend && npm run lint

# Run tests
cd backend && npm run test
```

### Production

```bash
# Build both
npm run build

# Build backend only
cd backend && npm run build

# Build frontend only
cd frontend && npm run build

# Start production server
NODE_ENV=production npm start
```

### Docker

```bash
# Start with Docker
docker-compose up

# Build images
docker-compose build

# Stop containers
docker-compose down

# View logs
docker-compose logs -f
```

---

## 🎯 Features

### Recording
1. Click "Start Recording" button
2. Speak into your microphone
3. Click "Stop & Save"
4. Recording appears in Library

### Library
1. Go to History page
2. See all your recordings
3. Click to play
4. Click delete to remove

### Settings
1. Go to Settings page
2. Enter your name and email
3. Click "Save Settings"
4. Settings saved locally

### Help
1. Go to Help page
2. Read usage guide
3. Check FAQ
4. View pro tips

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is available
# Kill process on port 3001 or change PORT in .env

# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Frontend won't start
```bash
# Check if port 3000 is available
# Kill process on port 3000

# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Files not uploading
- Check `/backend/uploads/` exists
- Verify file format is supported
- Check file size < 500MB
- Ensure backend is running

### Preflight check fails
```bash
# Run manually
node scripts/preflightCheck.js

# It will create missing directories
```

---

## 📁 Project Structure

```
vnotes/
├── backend/              # Node.js + Express
│   ├── src/
│   │   ├── config/      # Configuration
│   │   ├── controllers/ # Request handlers
│   │   ├── services/    # Business logic
│   │   ├── routes/      # API endpoints
│   │   ├── utils/       # Utilities
│   │   └── server.ts    # Entry point
│   ├── uploads/         # File storage
│   └── package.json
│
├── frontend/             # React + TypeScript
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   ├── services/    # API calls
│   │   ├── utils/       # Utilities
│   │   └── types/       # TypeScript types
│   └── package.json
│
├── scripts/              # Utility scripts
├── docker-compose.yml    # Docker config
└── package.json          # Root config
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/recordings/upload` | Upload file |
| GET | `/api/recordings` | Get all recordings |
| GET | `/api/recordings/:id` | Get single recording |
| DELETE | `/api/recordings/:id` | Delete recording |
| GET | `/uploads/:filename` | Serve file |
| GET | `/health` | Health check |

---

## 📝 Environment Variables

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
UPLOADS_DIR=uploads
MAX_FILE_SIZE=524288000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
VITE_ENABLE_TRANSCRIPTION=false
```

---

## 🐳 Docker Quick Start

```bash
# Start everything
docker-compose up

# Access
# Frontend: http://localhost:3000
# Backend: http://localhost:3001

# Stop
docker-compose down
```

---

## 📚 Documentation

- **[README.md](./README.md)** - Full project documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide
- **[REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md)** - Changes made

---

## ✅ Checklist

- [ ] Node.js installed
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] Environment variables set (optional)
- [ ] Preflight check passed
- [ ] Development servers running
- [ ] Frontend accessible at localhost:3000
- [ ] Backend accessible at localhost:3001
- [ ] Can record audio
- [ ] Can view recordings in library

---

## 🆘 Need Help?

1. Check the [README.md](./README.md)
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md)
3. Check browser console for errors
4. Check backend logs
5. Run preflight check: `npm run predev`

---

## 🚀 Next Steps

### Development
- Explore the codebase
- Read ARCHITECTURE.md
- Run tests: `cd backend && npm run test`
- Try making changes

### Deployment
- Read DEPLOYMENT.md
- Choose deployment platform
- Follow deployment steps
- Monitor application

### Enhancement
- Add new features
- Improve UI/UX
- Optimize performance
- Add more tests

---

## 📞 Support

For issues or questions:
1. Check documentation
2. Review troubleshooting section
3. Check existing issues
4. Create new issue with details

---

**Happy recording! 🎙️**

Last Updated: May 2026
