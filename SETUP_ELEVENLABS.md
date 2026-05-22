# ElevenLabs Speech-to-Text Setup Guide

This guide explains how to set up ElevenLabs API for automatic audio transcription in VNotes.

## Overview

VNotes now includes automatic speech-to-text transcription powered by ElevenLabs. When you upload or record an audio file, it will be automatically transcribed and displayed in the Transcript & Insights panel.

## Prerequisites

- ElevenLabs account (free or paid)
- API key with speech-to-text permissions

## Step 1: Get an ElevenLabs API Key

1. Go to [https://elevenlabs.io](https://elevenlabs.io)
2. Sign up for a free account or log in
3. Navigate to **API Keys** in your account settings
4. Create a new API key
5. **Important**: Ensure the API key has the following permissions:
   - `speech_to_text` - Required for transcription
   - `speech_to_text_read` - For reading transcription status

## Step 2: Configure the Backend

1. Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

2. Edit `backend/.env` and add your API key:

```env
ELEVENLABS_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual ElevenLabs API key.

3. Save the file

## Step 3: Configure the Frontend

1. Create a `.env` file in the `frontend/` directory:

```bash
cd frontend
cp .env.example .env
```

2. Edit `frontend/.env` and enable transcription:

```env
VITE_ENABLE_TRANSCRIPTION=true
VITE_API_URL=http://localhost:3001/api
```

3. Save the file

## Step 4: Install Dependencies

Install the required packages:

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

## Step 5: Start the Application

1. Start the backend server:

```bash
cd backend
npm run dev
```

2. In a new terminal, start the frontend:

```bash
cd frontend
npm run dev
```

3. Open your browser to `http://localhost:3000`

## Step 6: Test Transcription

1. Go to the **Recording** page
2. Either:
   - Record a new audio clip, or
   - Click **Upload File** to upload an existing audio/video file
3. The transcription will start automatically
4. Wait for the transcription to complete (this may take a few moments depending on file size)
5. The transcription will appear in the **Transcript & Insights** panel

## Troubleshooting

### "API key missing permissions" Error

**Problem**: You see an error about missing permissions

**Solution**: 
- Verify your API key has `speech_to_text` permission
- Create a new API key with the correct permissions
- Update your `.env` file with the new key
- Restart the backend server

### "Transcription pending" Message

**Problem**: Transcription shows as pending instead of completing

**Possible causes**:
1. API key not configured in `.env`
2. API key doesn't have speech-to-text permissions
3. Network connectivity issue
4. File is too large (max 500MB)

**Solution**:
- Check that `.env` file exists and has the correct API key
- Verify API key permissions in ElevenLabs dashboard
- Check your internet connection
- Try with a smaller audio file

### Backend Won't Start

**Problem**: Backend fails to start with "EADDRINUSE" error

**Solution**: Port 3001 is already in use
```bash
# Kill the process using port 3001
# On Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -i :3001
kill -9 <PID>
```

## API Endpoints

### Transcribe Recording

```
POST /api/recordings/:id/transcribe
```

Transcribes an uploaded audio file.

**Response**:
```json
{
  "data": {
    "id": "recording_id",
    "transcription": "Full transcription text...",
    "originalName": "audio.wav",
    ...
  }
}
```

## Supported Audio Formats

- WAV
- MP3
- M4A
- AAC
- FLAC
- OGG

## Supported Video Formats

- MP4
- MKV
- WebM
- AVI
- MOV

## Pricing

ElevenLabs offers:
- **Free tier**: Limited transcription minutes per month
- **Paid plans**: Unlimited transcription with higher quality

Check [ElevenLabs pricing](https://elevenlabs.io/pricing) for current rates.

## Security Notes

⚠️ **Important**: 
- Never commit `.env` files to version control
- Keep your API key secret
- Use environment variables in production
- Rotate API keys periodically

## Next Steps

Once transcription is working:
1. Try the **Summary** feature to generate AI summaries
2. Use **Key Moments** to bookmark important parts
3. Use **Search** to find recordings by content

## Support

For issues with:
- **VNotes**: Check the [GitHub repository](https://github.com/shlokbshetty/Vnotes)
- **ElevenLabs API**: Visit [ElevenLabs documentation](https://elevenlabs.io/docs)
