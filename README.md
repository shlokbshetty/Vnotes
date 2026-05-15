# VNotes

A web application for voice note recording and transcription with real-time features.

## Features

- Real-time voice recording with live transcription
- Recording library with search and filtering
- Live waveform visualization during recording
- AI-powered key moment detection
- Export functionality for recordings and transcripts

## Tech Stack

**Frontend:**
- React + TypeScript
- Vite (build tool)
- Tailwind CSS

**Backend:**
- Node.js + Express
- TypeScript

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
│   ├── server.ts
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
└── README.md
```

## Setup

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```