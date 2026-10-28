# Changelog

All notable changes to **VNotes** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v1.1.0] - 2026-10-28

### Added
- **Google OAuth 2.0 & OIDC Authentication (`oauthService.ts`, `authRoutes.ts`)**: Added `POST /auth/oauth` to exchange Google authorization codes and cryptographically verify Google ID tokens against Google JWKS.
- **Stateless HS256 JWT & Stateful Session Revocation (`authService.ts`, `sessionStore.ts`)**: Added HS256 JWT generation (`iss: 'vnotes-backend'`, `jti`) and `POST /auth/logout` with in-memory token/JTI revocation and hourly TTL cleanup.
- **Endpoint Rate Limiting (`rateLimiter.ts`)**: Added `oauthLimiter` (5 req / 5 min per IP) and `logoutLimiter` (10 req / 1 hr per IP).
- **Preflight Environment Verifier (`scripts/preflightCheck.js`)**: Added automated `predev` script checking Node/npm, `node_modules`, `.env` files, and `GOOGLE_CLIENT_ID` parity between frontend and backend.
- **Subscription Pricing API & UI (`pricingController.ts`, `PricingPage.tsx`)**: Added `GET /api/pricing` serving structured tier cards (`Free`, `Professional`) and a categorized feature comparison table.
- **Property-Based Testing Suite (`fast-check`)**: Added comprehensive `*.pbt.test.ts` suites across backend (`jwt`, `oauth`, `authMiddleware`, `session`, `env`, `pricingController`) and frontend (`auth`, `protectedRoutes`, `PricingPage`).
- **Production Documentation Suite & Vector Architecture Diagram**: Added `docs/assets/system-overview.svg`, `ARCHITECTURE.md`, `API.md`, `DEVELOPMENT.md`, `CONTRIBUTING.md`, `SECURITY.md`, `SUPPORT.md`, `ROADMAP.md`, `VISION.md`, and GitHub governance templates.

### Changed
- **Multi-Tenant Recording Isolation (`recordingController.ts`, `recordingService.ts`)**: Scoped all recording uploads, listings, searches, detail views, deletions, key-moment mutations, transcriptions, and summaries to the authenticated user (`req.userId`).
- **ElevenLabs Scribe v2 Integration (`transcriptionService.ts`)**: Upgraded speech-to-text streaming client to use `model_id: 'scribe_v2'` with a 120-second timeout and graceful offline fallback.

### Security
- Enforced strict startup validation in `backend/src/config/env.ts` requiring `JWT_SECRET >= 32` characters and valid `JWT_EXPIRATION` bounds (`60`–`604800` seconds).
- Added cross-tenant ownership checks returning `403 FORBIDDEN` when a user attempts to access or delete another user's recording.

---

## [v1.0.0] - 2026-09-15

### Added
- **Initial Full-Stack Release**:
  - React 18 + Vite 5 + Tailwind CSS frontend with browser `MediaRecorder` audio/video capture and file upload modal.
  - Express 4 + TypeScript backend supporting `multer` media uploads up to 500 MB across audio (`wav`, `mp3`, `m4a`, `aac`, `flac`) and video (`mp4`, `mkv`, `webm`, `avi`, `mov`) formats.
  - Startup disk-to-metadata synchronization utility (`syncUploadsWithMetadata` in `backend/src/utils/syncUploads.ts`).
  - Timestamped key moments (`POST` / `DELETE /api/recordings/:id/key-moments`) and NLP summary/action-item extraction (`summaryService.ts`).
  - Multi-container `docker-compose.yml` setup for local and containerized deployment.
