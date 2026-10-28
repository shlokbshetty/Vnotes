# VNotes Architectural Vision

## 1. Mission Statement

**VNotes** exists to eliminate the friction between spoken conversations and institutional memory. Every day, critical product decisions, action items, and architectural insights are buried inside hour-long audio and video recordings. VNotes transforms raw voice and video streams into structured, searchable, and privacy-respecting knowledge artifacts within seconds.

---

## 2. Core Architectural Pillars

### Pillar 1: Cryptographic Identity & Zero-Trust Tenant Isolation
Authentication and data ownership are foundational, not afterthoughts. By verifying OIDC tokens directly against Google's JWKS keys, issuing short-lived HS256 JWTs with revocable `jti` identifiers, and enforcing strict per-user ownership checks on every recording mutation, VNotes ensures each user's voice notes remain strictly private.

### Pillar 2: Formal Correctness via Property-Based Testing
Voice and authentication pipelines must handle arbitrary edge cases gracefully. VNotes pioneers the use of **`fast-check` Property-Based Testing** across both its Express backend and React frontend—proving invariants over thousands of randomized JWT payloads, malformed headers, session lifecycles, and UI states rather than relying solely on static example tests.

### Pillar 3: Resilient, Offline-Capable Developer Ergonomics
A developer should be able to clone VNotes, run a single preflight-checked command (`npm run dev`), and exercise the entire recording, upload reconciliation (`syncUploadsWithMetadata`), transcription, and summarization lifecycle locally—even when offline or without paid external AI credentials.

### Pillar 4: Modular AI Pipeline Evolution
By cleanly decoupling media ingestion (`recordingController.ts` / `multer`), speech-to-text transcription (`transcriptionService.ts`), and post-processing synthesis (`summaryService.ts`), VNotes can seamlessly adopt next-generation speech models, real-time WebSocket streaming, and semantic vector indexing without disrupting client contracts.
