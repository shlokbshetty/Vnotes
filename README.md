# VNotes — Intelligent Voice & Video Knowledge Hub

[![Version](https://img.shields.io/badge/version-1.1.0-6366f1.svg)](CHANGELOG.md)
[![Node](https://img.shields.io/badge/Node.js-18%2B-339933.svg?logo=node.js)](backend/package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6.svg?logo=typescript)](backend/tsconfig.json)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg?logo=react)](frontend/package.json)
[![Express](https://img.shields.io/badge/Express-4.18-000000.svg?logo=express)](backend/package.json)
[![Tests](https://img.shields.io/badge/Tests-Vitest%20%2B%20fast--check-10b981.svg)](DEVELOPMENT.md)

**VNotes** is a full-stack voice and video intelligence platform that captures browser-based audio/video recordings or multi-format media uploads (up to 500 MB), generates high-accuracy speech-to-text transcriptions via the **ElevenLabs Scribe v2 API**, and synthesizes structured executive summaries, key takeaways, action items, and timestamped key moments. Secured by **Google OAuth 2.0** (OIDC ID token verification against Google JWKS), stateless **HS256 JWT sessions** with instant JTI/token revocation, and strict per-user tenant isolation, VNotes transforms unstructured spoken meetings and voice notes into searchable, actionable knowledge.

---

## System Architecture Summary

![VNotes System Architecture](docs/assets/system-overview.svg)

VNotes employs a decoupled TypeScript client-server architecture:
- **React 18 + Vite 5 SPA (`frontend/`)**: Implements the browser `MediaRecorder` capture flow, Google OAuth 2.0 popup/redirect initiation, protected route guards (`ProtectedRoute`), and interactive playback with synchronized transcripts, AI summaries, and timestamped bookmarks.
- **Express 4 + TypeScript API (`backend/`)**: Enforces endpoint-specific rate limiting (`oauthLimiter`, `logoutLimiter`), verifies Google OAuth authorization codes and OIDC ID tokens via `google-auth-library`, issues and revokes HS256 session JWTs, handles 500 MB `multer` media streams, orchestrates ElevenLabs Scribe v2 transcription (`transcriptionService.ts`) and NLP summarization (`summaryService.ts`), and reconciles local disk uploads (`backend/uploads/`) with persistent recording metadata (`backend/src/data/recordings.json`) on startup.

For a comprehensive breakdown of component boundaries, authentication sequences, storage reconciliation, and design decisions, see **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** (also available at **[ARCHITECTURE.md](ARCHITECTURE.md)**).

---

## Documentation Index

| Document | Description |
| :--- | :--- |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** / **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** | System design patterns, tech stack justifications, directory structure, component breakdowns, and data flows |
| **[API.md](API.md)** / **[docs/API.md](docs/API.md)** | Complete REST API reference, authentication headers, rate limits, request/response schemas, and error codes |
| **[DEVELOPMENT.md](DEVELOPMENT.md)** / **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** | Local setup, `preflightCheck.js`, upload-metadata sync, Vitest + `fast-check` property-based testing, and linting |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | Branching strategy, Conventional Commits specification, pull request checklist, and quality gates |
| **[SECURITY.md](SECURITY.md)** | Supported versions, OAuth/JWT security controls, tenant isolation, and vulnerability disclosure policy |
| **[SUPPORT.md](SUPPORT.md)** | Support channels, issue labels, and troubleshooting FAQs |
| **[ROADMAP.md](ROADMAP.md)** & **[VISION.md](VISION.md)** | Short-term engineering milestones and long-term architectural vision |
| **[CHANGELOG.md](CHANGELOG.md)** | Release history adhering to Keep a Changelog and Semantic Versioning |

---

## Prerequisites

- **Node.js**: `>= 18.0.0` (LTS recommended) and **npm** `>= 9.0.0`
- **Docker & Docker Compose** *(Optional)*: For containerized full-stack execution
- **Google Cloud Console OAuth 2.0 Credentials**: Client ID and Client Secret configured with `http://localhost:3000/auth/callback` as an Authorized Redirect URI
- **ElevenLabs API Key** *(Optional in dev)*: For live `scribe_v2` speech-to-text transcription (gracefully falls back to deterministic development transcripts when omitted)

---

## Step-by-Step Local Setup

### 1. Clone the Repository & Install Dependencies

```bash
git clone https://github.com/your-org/Vnotes.git
cd Vnotes

# Install root orchestration dependencies (concurrently)
npm install

# Install backend dependencies
npm --prefix backend install

# Install frontend dependencies
npm --prefix frontend install
```

### 2. Configure Environment Variables

Copy the example environment files at the root, backend, and frontend levels:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Populate `backend/.env` and `frontend/.env` with your Google OAuth Client ID, Client Secret, and a minimum 32-character `JWT_SECRET` (see [Environment Configuration Mapping](#environment-configuration-mapping) below).

### 3. Run the Preflight Environment Check

VNotes includes an automated preflight verifier (`scripts/preflightCheck.js`) that validates Node installation, dependency trees (`node_modules`), `.env` presence, and `GOOGLE_CLIENT_ID` alignment between `frontend/.env` and `backend/.env`:

```bash
npm run predev
```

### 4. Start the Development Servers

```bash
npm run dev
```

This runs `preflightCheck.js` and concurrently launches both services:
- **Frontend SPA**: `http://localhost:3000`
- **Backend API**: `http://localhost:3001`
- **Health Check**: `http://localhost:3001/health`

---

## Build, Test & Execution Commands

| Scope | Command | Description |
| :--- | :--- | :--- |
| **Root** | `npm run predev` | Executes `node scripts/preflightCheck.js` to validate local setup and OAuth Client ID parity |
| **Root** | `npm run dev` | Runs `predev` then concurrently starts backend (`:3001`) and frontend (`:3000`) in watch mode |
| **Root** | `npm run build` | Compiles both backend TypeScript (`backend/dist`) and frontend Vite bundle (`frontend/dist`) |
| **Root** | `npm start` | Runs compiled production backend (`node backend/dist/server.js`) |
| **Backend** | `npm --prefix backend run dev` | Starts Express server with `ts-node-dev --respawn --transpile-only src/server.ts` |
| **Backend** | `npm --prefix backend test` | Runs core Vitest unit & integration suites (`pricing`, `services`, `jwt`, `oauth`, `sessionStore`) |
| **Backend** | `npm --prefix backend run test:vitest` | Runs all Vitest suites including `fast-check` property-based tests (`*.pbt.test.ts`) |
| **Backend** | `npm --prefix backend run lint` | Lints backend TypeScript source files (`eslint src --ext .ts`) |
| **Frontend** | `npm --prefix frontend test` | Runs frontend React Testing Library + Vitest suites (`vitest run`) |
| **Frontend** | `npm --prefix frontend run lint` | Runs strict ESLint checks (`--max-warnings 0`) across `ts,tsx` files |
| **Docker** | `docker-compose up --build` | Builds and starts containerized `backend` (`:3001`) and `frontend` (`:3000`) services |

---

## Environment Configuration Mapping

VNotes uses environment files across three scopes: root (`.env.example` for Docker Compose), `backend/.env.example`, and `frontend/.env.example`.

### Backend Configuration (`backend/.env.example`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `3001` | HTTP port bound by the Express server |
| `NODE_ENV` | No | `development` | Runtime environment (`development`, `production`, `test`) |
| `FRONTEND_URL` | No | `http://localhost:3000` | Allowed CORS origin for browser requests |
| `GOOGLE_CLIENT_ID` | **Yes** | — | Google OAuth 2.0 Client ID (must match `VITE_GOOGLE_CLIENT_ID`) |
| `GOOGLE_CLIENT_SECRET` | **Yes** | — | Google OAuth 2.0 Client Secret used for authorization code exchange |
| `GOOGLE_REDIRECT_URI` | **Yes** | `http://localhost:3000/auth/callback` | Registered OAuth 2.0 redirect URI |
| `JWT_SECRET` | **Yes** | — | Secret key (`>= 32` chars) used to sign and verify HS256 session tokens |
| `JWT_EXPIRATION` | No | `86400` | Session JWT time-to-live in seconds (default 24 hours; range `60`–`604800`) |
| `ELEVENLABS_API_KEY` | No* | — | ElevenLabs API key (`xi-api-key`) for `scribe_v2` transcription (*falls back to mock in dev) |
| `SUPABASE_URL` | No | — | Optional Supabase project URL for cloud persistence extensions |
| `SUPABASE_ANON_KEY` | No | — | Optional Supabase anonymous/service key |
| `UPLOAD_DIR` | No | `./uploads` | Local directory for storing uploaded audio/video files |

### Frontend Configuration (`frontend/.env.example`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | **Yes** | `http://localhost:3001` | Base URL for backend REST API requests and media streaming |
| `VITE_GOOGLE_CLIENT_ID` | **Yes** | — | Google OAuth 2.0 Client ID (verified by `preflightCheck.js` to match backend) |
| `VITE_GOOGLE_REDIRECT_URI` | No | `http://localhost:3000/auth/callback` | Frontend callback URL for Google OAuth redirect |
| `VITE_SUPABASE_URL` | No | — | Optional Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | No | — | Optional Supabase public anon key |

---

## License

Released under the **MIT License**.
