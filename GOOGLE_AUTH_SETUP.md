# Google Authentication Setup

Guide for setting up Google OAuth 2.0 authentication in VNotes.

## Prerequisites

Node.js 16+, npm or yarn, Google Cloud Console account

## Setup Steps

### Step 1: Create Google OAuth Application

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Create or select a project
3. Enable Google+ API
4. Navigate to "Credentials" > "Create Credentials" > "OAuth 2.0 Client ID"
5. Select "Web application"
6. Add Authorized redirect URIs:
   - Development: http://localhost:3000/auth/callback
   - Production: https://yourdomain.com/auth/callback
7. Copy Client ID and Client Secret

### Step 2: Configure Backend (.env)

Create or update `backend/.env`:
```
GOOGLE_OAUTH_CLIENT_ID=your_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret
GOOGLE_OAUTH_CALLBACK_URI=http://localhost:3000/auth/callback
JWT_SECRET=generate_random_string_min_32_chars
JWT_EXPIRATION=86400
CORS_ORIGIN=http://localhost:3000
PORT=3001
NODE_ENV=development
```

Note: For production, use HTTPS URLs and a cryptographically secure JWT_SECRET.

### Step 3: Configure Frontend (.env)

Create or update `frontend/.env`:
```
VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id
VITE_API_URL=http://localhost:3001/api
```

## Step 4: Install Dependencies

```bash
cd backend && npm install
cd frontend && npm install
```

## Step 5: Run Tests

```bash
cd backend
npm test
```

All tests should pass.

## Step 6: Start Development

```bash
npm run dev
```

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Step 7: Test OAuth Flow

1. Open http://localhost:3000
2. Click "Sign in with Google"
3. Authenticate with Google account
4. Should redirect to dashboard
5. User profile should display
6. Try uploading a recording
7. Click logout

## Production Deployment Checklist

- Google OAuth app has production credentials
- CORS_ORIGIN updated to production frontend domain
- GOOGLE_OAUTH_CALLBACK_URI updated to production URL (HTTPS)
- JWT_SECRET is unique and cryptographically secure
- Database migrations applied to production
- All tests pass
- Frontend built
- Backend built
- SSL/TLS certificates configured
- Rate limiting configured

## Environment Variables for Production

```bash
GOOGLE_OAUTH_CLIENT_ID=your_production_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_production_client_secret
GOOGLE_OAUTH_CALLBACK_URI=https://yourdomain.com/auth/callback
JWT_SECRET=your_production_secret_key_32_chars_minimum
JWT_EXPIRATION=86400
CORS_ORIGIN=https://yourdomain.com
PORT=3001
NODE_ENV=production
```

Generate secure JWT_SECRET:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((1..32 | % {[char](Get-Random -Minimum 33 -Maximum 127))} | Join-String)))
```

## OAuth Flow

1. Frontend: User clicks "Sign in with Google"
2. Frontend: Redirects to Google signin with client ID and callback URI
3. Google: User authenticates
4. Google: Returns authorization code
5. Frontend: Receives code, sends to backend /auth/oauth
6. Backend: Exchanges code for ID token with Google
7. Backend: Verifies ID token signature
8. Backend: Extracts user data from ID token
9. Backend: Generates JWT session token
10. Frontend: Stores token in localStorage
11. Frontend: Redirects to dashboard

## Testing Commands

```bash
# Run all tests
npm test

# Run backend tests only
cd backend && npm test

# Run with coverage
npm test -- --coverage
```

## Troubleshooting

Invalid OAuth Code:
- Verify GOOGLE_OAUTH_CALLBACK_URI matches app configuration
- Check code hasn't expired (valid for ~10 minutes)
- Verify CLIENT_ID and CLIENT_SECRET are correct

CORS Error:
- Check CORS_ORIGIN matches request origin
- Verify backend includes Access-Control-Allow-Origin header
- Ensure credentials mode is include in fetch requests

Token Invalid/Expired:
- Check JWT_SECRET is the same in backend
- Verify token hasn't exceeded 24-hour expiration
- Clear localStorage and login again

Rate Limit (429):
- Wait 5 minutes for /auth/oauth limit reset
- Wait 1 hour for /auth/logout limit reset

## Security Notes

- JWT_SECRET must be cryptographically secure (min 32 chars)
- Always use HTTPS in production
- CORS restricted to specific frontend domain
- Rate limiting active on auth endpoints
- Sessions expire after 24 hours
- Tokens revoked immediately on logout

## API Documentation

For detailed API documentation, see: backend/API_AUTH_DOCUMENTATION.md

## Support

For issues:
- Check SETUP_ELEVENLABS.md for transcription setup
- Review backend logs
- Check browser console for frontend errors
- Verify API key and credentials
