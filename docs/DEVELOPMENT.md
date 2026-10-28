# VNotes Local Development Guide

This guide covers setting up a local development environment for **VNotes**, understanding the startup preflight and storage synchronization hooks, running unit/integration/property-based test suites, and executing code quality checks.

---

## 1. Local Developer Environment Setup

### 1.1 System Requirements
- **Node.js**: `v18.0.0` or newer (`v20 LTS` recommended)
- **npm**: `v9.0.0` or newer
- **Git**: `v2.30+`

### 1.2 Installing Dependencies Across Packages
VNotes is structured with a root orchestration `package.json` plus independent `backend/` and `frontend/` packages:

```bash
# 1. Install root scripts (concurrently)
npm install

# 2. Install backend TypeScript, Express, and Vitest dependencies
npm --prefix backend install

# 3. Install frontend React, Vite, Tailwind, and Testing Library dependencies
npm --prefix frontend install
```

### 1.3 Environment Configuration & Secret Generation
Copy the environment templates in all three directories:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Generate a cryptographically strong 32+ character `JWT_SECRET` for `backend/.env`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Ensure `GOOGLE_CLIENT_ID` in `backend/.env` and `VITE_GOOGLE_CLIENT_ID` in `frontend/.env` are identical.

---

## 2. Preflight Validation (`scripts/preflightCheck.js`)

Whenever you run `npm run dev`, the `predev` lifecycle hook executes `node scripts/preflightCheck.js`. This script performs 6 automated checks before launching Vite or Express:

1. Verifies Node.js & npm availability.
2. Checks root `node_modules/`.
3. Checks `backend/node_modules/` and `frontend/node_modules/`.
4. Verifies `backend/.env` and `frontend/.env` exist and do not contain unconfigured placeholder strings (`your_..._here`).
5. **Cross-Package OAuth Client ID Parity**: Parses `GOOGLE_CLIENT_ID` from `backend/.env` and `VITE_GOOGLE_CLIENT_ID` from `frontend/.env` and fails fast if they diverge (preventing Google ID token audience verification errors).
6. Ensures `backend/uploads/` and `backend/src/data/` directories exist on disk.

Run the preflight check standalone at any time:

```bash
npm run predev
```

---

## 3. Data Storage, Seed Fixtures & Upload Reconciliation

### 3.1 Metadata Store (`backend/src/data/recordings.json`)
Recording metadata is stored in `backend/src/data/recordings.json`. If the file does not exist on first boot, `recordingService.ts` automatically initializes it with an empty JSON array (`[]`).

### 3.2 Pricing Fixture (`backend/src/data/pricing.json`)
Subscription tiers (`free`, `pro`) and the feature comparison matrix served by `GET /api/pricing` live in `backend/src/data/pricing.json`. Validated on read by `pricingController.ts` (`validatePricingData()`).

### 3.3 Startup Upload Sync (`backend/src/utils/syncUploads.ts`)
On server boot (`server.ts`), `syncUploadsWithMetadata()` scans `backend/uploads/` and compares physical files against `backend/src/data/recordings.json`:
- Any media file present in `backend/uploads/` that lacks a metadata entry in `recordings.json` is automatically registered with inferred `mimeType`, `type` (`audio` or `video`), `fileSize`, and `createdAt` birthtime.
- This allows developers to drop sample `.mp3`, `.wav`, or `.mp4` files directly into `backend/uploads/` and restart the backend to immediately test playback, transcription, and summarization.

### 3.4 Offline Transcription Fallback
When `ELEVENLABS_API_KEY` is omitted or left as `your_elevenlabs_api_key_here` in `backend/.env`, calling `POST /api/recordings/:id/transcribe` automatically returns a deterministic placeholder transcript from `transcriptionService.ts`. This enables full end-to-end local testing without consuming external API credits.

---

## 4. Testing Strategy & Commands

VNotes combines **unit tests**, **Supertest HTTP integration tests**, **React Testing Library component tests**, and **`fast-check` Property-Based Tests (PBT)**.

### 4.1 Backend Test Suites (`backend/tests/`)

| Command | Scope | Files Executed |
| :--- | :--- | :--- |
| `npm --prefix backend test` | Core Unit & Integration | `pricingController.test.ts`, `services.unit.test.ts`, `jwt.service.unit.test.ts`, `oauth.service.unit.test.ts`, `session.store.unit.test.ts`, `oauthIntegration.test.ts` |
| `npm --prefix backend run test:vitest` | All Vitest + Property-Based Tests | Runs all `*.test.ts` and `*.pbt.test.ts` suites in `backend/tests/` |
| `npm --prefix backend run test:api` | Standalone API Smoke Script | `ts-node tests/api.test.ts` |
| `npm --prefix backend run test:auth` | Standalone Auth Smoke Script | `ts-node tests/authService.test.ts` |

#### Backend Property-Based Tests (`fast-check`)
Located in `backend/tests/*.pbt.test.ts`, these suites verify universal security and data invariants across hundreds of randomly generated inputs:
- `jwt.pbt.test.ts`: Verifies that arbitrary `user_id` and `email` payloads round-trip through `generateJWT` -> `verifyJWT` with valid HS256 signatures, `iss === 'vnotes-backend'`, and monotonic `exp > iat`.
- `authMiddleware.pbt.test.ts`: Verifies that arbitrary malformed headers, tampered signatures, or revoked tokens never bypass `authMiddleware`.
- `oauth.pbt.test.ts`: Tests Google OIDC token claim validation and error mapping across generated token payloads.
- `session.pbt.test.ts`: Verifies `sessionStore` revocation idempotency and TTL cleanup invariants.
- `env.pbt.test.ts`: Tests `env.ts` fail-fast validation against missing or out-of-range environment variables.
- `pricingController.pbt.test.ts`: Verifies schema validation invariants for pricing tier structures.

### 4.2 Frontend Test Suites (`frontend/src/test/`)

```bash
# Run all frontend unit, component, and property-based tests once
npm --prefix frontend test

# Run frontend tests in interactive watch mode
npm --prefix frontend run test:watch
```

Frontend suites use **Vitest + JSDOM + `@testing-library/react`** to test:
- `AuthContext.unit.test.tsx` & `auth.pbt.test.tsx`: Session persistence, token expiration checks, and logout state clearing.
- `ProtectedRoute.unit.test.tsx` & `protectedRoutes.pbt.test.tsx`: Unauthenticated redirection to `/login`.
- `LoginPage.unit.test.tsx` & `OAuthCallbackPage.unit.test.tsx`: OAuth initiation and callback error states.
- `PricingPage.test.tsx` & `PricingPage.pbt.test.tsx`: Tier rendering and responsive layout invariants.

---

## 5. Linting, Type-Checking & Production Builds

```bash
# Lint backend TypeScript sources
npm --prefix backend run lint

# Lint frontend TypeScript/React sources (zero warnings enforced)
npm --prefix frontend run lint

# Build both backend (dist/) and frontend (dist/) production bundles
npm run build
```
