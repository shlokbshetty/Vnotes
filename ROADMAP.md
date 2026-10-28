# VNotes Product & Engineering Roadmap

This document tracks planned short-term milestones, medium-term platform enhancements, and upcoming features for **VNotes**.

---

## Short-Term Milestones (Q4 2026 — v1.2.0)

- [ ] **PostgreSQL / Supabase Persistence Migration**:
  - Transition recording metadata from `backend/src/data/recordings.json` to managed Supabase PostgreSQL tables with Row-Level Security (RLS) policies keyed on `user_id`.
  - Persist user profile metadata (`name`, `profile_picture_url`, `account_created_timestamp`, `last_login_timestamp`) so `GET /api/user/profile` returns full historical profile details.
- [ ] **Distributed Session Revocation via Redis**:
  - Replace the single-process `Map<string, RevokedSessionEntry>` in `sessionStore.ts` with a Redis-backed TTL blacklist to support horizontally scaled backend instances.
- [ ] **Cloud Object Storage (S3 / Supabase Storage)**:
  - Add pluggable storage adapters (`LocalDiskAdapter` vs. `S3StorageAdapter`) with pre-signed range-request URLs for low-latency video scrubbing.

---

## Medium-Term Milestones (Q1 2027 — v1.3.0)

- [ ] **Speaker Diarization & Word-Level Timestamps**:
  - Leverage ElevenLabs Scribe v2 speaker diarization metadata to attribute transcript segments to individual speakers (`Speaker A`, `Speaker B`) and highlight words synchronously during media playback.
- [ ] **LLM-Powered Semantic Summarization & Custom Templates**:
  - Augment the heuristic `summaryService.ts` pipeline with structured LLM summarization templates (e.g., *1-on-1 Coaching*, *Sprint Retrospective*, *Sales Discovery Call*, *Engineering Post-Mortem*).
- [ ] **Multi-Format Export Engine**:
  - Implement one-click export of transcripts, summaries, action items, and key moments to **PDF**, **DOCX**, **Markdown**, and **SRT / WebVTT** caption files.

---

## Long-Term Milestones (Q2–Q3 2027 — v2.0.0)

- [ ] **Real-Time WebSocket Live Transcription**:
  - Stream live `MediaRecorder` audio chunks over WebSockets during active recording sessions for real-time captioning and instant bookmarking.
- [ ] **Semantic Vector Search (pgvector)**:
  - Generate embeddings for recording transcripts and summaries, enabling natural-language cross-recording queries (e.g., *"What did we decide about Q4 pricing in last month's sync?"*).
- [ ] **Workspace Collaboration & Shared Folders**:
  - Introduce team workspaces, role-based access control (`owner`, `editor`, `viewer`), and time-coded inline comment threads.
