# Security Policy

The **VNotes** team takes the security of user audio/video recordings, transcriptions, and authentication credentials seriously. This document details supported versions, built-in security controls, and our coordinated vulnerability disclosure process.

---

## 1. Supported Versions

| Version | Supported | Status |
| :--- | :---: | :--- |
| `1.1.x` | Yes | Active production release line |
| `1.0.x` | Yes | Security patches only |
| `< 1.0.0` | No | End-of-life |

---

## 2. Built-in Security Controls

1. **Google OAuth 2.0 & OIDC JWKS Verification (`oauthService.ts`)**:
   - Authorization codes are exchanged server-side via `google-auth-library` (`OAuth2Client.getToken`).
   - Google ID tokens are cryptographically verified against Google's public JWKS keys (`verifyIdToken`), enforcing strict checks on `aud` (`GOOGLE_CLIENT_ID`), `iss` (`accounts.google.com`), and `exp`.
2. **HS256 Session JWTs with Instant JTI Revocation (`authService.ts` & `sessionStore.ts`)**:
   - Session tokens are signed with `HS256` using a mandatory `>= 32`-character `JWT_SECRET`, scoped to `iss: 'vnotes-backend'`, and assigned a unique `jti` (`crypto.randomUUID()`).
   - Logging out via `POST /auth/logout` immediately blacklists both the raw token string and its `jti` in `sessionStore.ts`, preventing token replay before natural expiration.
3. **Endpoint Rate Limiting (`rateLimiter.ts`)**:
   - `POST /auth/oauth` is restricted to **5 requests per 5 minutes per IP** (`oauthLimiter`).
   - `POST /auth/logout` is restricted to **10 requests per hour per IP** (`logoutLimiter`).
4. **Tenant Ownership Isolation (`recordingController.ts`)**:
   - Every recording created via `POST /api/recordings/upload` is bound to `req.userId`.
   - Listing (`GET /api/recordings`), reading (`GET /api/recordings/:id`), deleting (`DELETE /api/recordings/:id`), key-moment editing, transcribing, and summarizing strictly verify `recording.user_id === req.userId` and return `403 FORBIDDEN` on cross-tenant access attempts.
5. **Upload Validation (`recordingRoutes.ts`)**:
   - `multer` enforces an explicit allowlist of audio (`wav`, `mpeg`, `mp3`, `m4a`, `aac`, `flac`) and video (`mp4`, `x-matroska`, `mkv`, `webm`, `avi`, `quicktime`) MIME types and caps file size at `500 MB`.

---

## 3. Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, report suspected vulnerabilities privately via:
- **Email**: `security@vnotes.dev`
- **GitHub Private Vulnerability Reporting**: Use the **Security -> Report a vulnerability** tab in the repository.

### What to Include
- Description of the vulnerability and affected component (`backend/src/services/oauthService.ts`, `authMiddleware.ts`, etc.).
- Step-by-step proof-of-concept (PoC) or HTTP request reproduction.
- Potential impact (e.g., cross-tenant recording access, JWT forgery, arbitrary file upload).

---

## 4. Response Timeline

| Stage | Target SLA |
| :--- | :--- |
| **Initial Acknowledgment** | Within **24 hours** |
| **Triage & Severity Assessment** | Within **72 hours** |
| **Patch Development & Verification** | Within **7 days** (Critical/High) / **14 days** (Medium/Low) |
| **Public Advisory & Release** | Coordinated disclosure after patch availability |
