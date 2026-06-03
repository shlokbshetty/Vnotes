# ElevenLabs Transcription Setup

Guide for setting up ElevenLabs speech-to-text transcription in VNotes.

## Overview

VNotes includes automatic speech-to-text transcription powered by ElevenLabs. Audio files are automatically transcribed when uploaded and displayed in the Transcript panel.

## Prerequisites

- ElevenLabs account (free or paid)
- API key with speech-to-text permissions

## Setup

### Step 1: Get ElevenLabs API Key

1. Go to https://elevenlabs.io
2. Sign up or log in
3. Navigate to API Keys in account settings
4. Create a new API key
5. Ensure it has permissions: speech_to_text, speech_to_text_read

### Step 2: Configure Backend

Edit `backend/.env`:
```env
ELEVENLABS_API_KEY=your_api_key_here
```

### Step 3: Configure Frontend

Edit `frontend/.env`:
```env
VITE_ENABLE_TRANSCRIPTION=true
VITE_API_URL=http://localhost:3001/api
```

### Step 4: Install and Run

```bash
npm install
npm run dev
```

### Step 5: Test Transcription

1. Go to Recording page
2. Record audio or upload a file
3. Wait for transcription (visible as "Transcribing...")
4. Transcription appears in Transcript panel

## Supported Formats

Audio: WAV, MP3, M4A, AAC, FLAC, OGG
Video: MP4, MKV, WebM, AVI, MOV

## API Endpoint

POST /api/recordings/:id/transcribe

Transcribes an uploaded audio file.

Response:
```json
{
  "data": {
    "id": "recording_id",
    "transcription": "Full transcription text...",
    "originalName": "audio.wav"
  }
}
```

## Troubleshooting

API key missing permissions:
- Verify API key has speech_to_text permission
- Create new API key with correct permissions
- Update .env and restart backend

Transcription pending:
- Check API key is configured in .env
- Verify API key has correct permissions
- Check internet connection
- Ensure file is under 500MB

Backend won't start:
- Check port 3001 is available
- Verify .env file exists
- Check Node.js is installed

## Pricing

Free tier: Limited transcription minutes per month
Paid plans: Unlimited transcription

Check https://elevenlabs.io/pricing for current rates

## Security

Important:
- Never commit .env files to version control
- Keep API key secret
- Use environment variables in production
- Rotate API keys periodically

## Support

For issues:
- Check error logs: npm run dev output
- Review browser console for frontend errors
- Visit ElevenLabs documentation: https://elevenlabs.io/docs
