# Support & Troubleshooting Guide

Need help running, configuring, or debugging **VNotes**? This document lists our support channels, issue tracker taxonomy, and solutions to frequently encountered setup issues.

---

## 1. Channels for Help

| Channel | Best For | Link / Contact |
| :--- | :--- | :--- |
| **Documentation Suite** | Architecture, REST API payloads, and local development setup | [README.md](README.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/API.md](docs/API.md), [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) |
| **GitHub Issues** | Reproducible bug reports and feature proposals | `.github/ISSUE_TEMPLATE/` |
| **Security Reports** | Private disclosure of security vulnerabilities | See [SECURITY.md](SECURITY.md) (`security@vnotes.dev`) |

---

## 2. Issue Tracker Labels

| Label | Description |
| :--- | :--- |
| `bug` | Confirmed defect in the React SPA, Express API, or media pipeline |
| `enhancement` | New feature request or UX improvement |
| `auth / oauth` | Issues related to Google OAuth 2.0, OIDC verification, or JWT sessions |
| `transcription / ai` | ElevenLabs Scribe v2 integration or NLP summary extraction |
| `storage / uploads` | Multer file uploads, `recordings.json`, or `syncUploads.ts` |
| `documentation` | Improvements to Markdown docs or SVG diagrams |
| `good first issue` | Well-scoped tasks suitable for new contributors |

---

## 3. Frequently Asked Questions (FAQ)

### Q1: `npm run dev` fails during `predev` with a `GOOGLE_CLIENT_ID` mismatch error. How do I fix it?
`scripts/preflightCheck.js` verifies that `GOOGLE_CLIENT_ID` in `backend/.env` matches `VITE_GOOGLE_CLIENT_ID` in `frontend/.env`. If they differ, Google ID token audience (`aud`) verification in `oauthService.ts` will fail with `401 Unauthorized`. Copy the exact same Google OAuth 2.0 Client ID into both `backend/.env` and `frontend/.env`.

### Q2: Why does the backend refuse to start with `JWT_SECRET must be at least 32 characters long`?
`backend/src/config/env.ts` enforces a minimum length of 32 characters for `JWT_SECRET` to prevent weak HS256 signing keys. Generate a secure key using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
and paste the 64-character hex output into `backend/.env`.

### Q3: Can I test transcription locally without an ElevenLabs API key?
Yes. If `ELEVENLABS_API_KEY` is omitted or left as `your_elevenlabs_api_key_here` in `backend/.env`, `transcriptionService.ts` automatically logs a warning and returns a realistic placeholder transcript so you can test transcription display, key-moment tagging, and AI summary generation offline.

### Q4: I placed `.mp3` or `.mp4` files directly into `backend/uploads/`, how do I make them appear in the UI?
Restart the backend server (`npm --prefix backend run dev`). On startup, `syncUploadsWithMetadata()` in `backend/src/utils/syncUploads.ts` scans `backend/uploads/` and automatically registers any untracked audio/video files in `backend/src/data/recordings.json`. Note that synced orphan files have no `user_id` until claimed or associated with a user account.

### Q5: Why am I getting `429 Too Many Requests` (`RATE_LIMIT_EXCEEDED`) when testing login?
`POST /auth/oauth` is protected by `oauthLimiter` (`backend/src/middlewares/rateLimiter.ts`), which allows a maximum of **5 authentication requests per 5 minutes per IP**. Wait 5 minutes or restart the development backend process to reset the in-memory rate-limit counters.
