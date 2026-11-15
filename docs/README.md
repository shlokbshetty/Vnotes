# VNotes Documentation Hub

Welcome to the comprehensive documentation hub for **VNotes** — an intelligent voice and video knowledge platform featuring browser recording, ElevenLabs speech-to-text transcription, AI-powered executive summarization, Google OAuth 2.0 / OIDC authentication, and session security.

---

## 📚 Documentation Navigation

```
docs/
├── Architecture & Design
│   ├── ARCHITECTURE.md                  # Comprehensive system architecture & data flows
│   └── design/DESIGN.md                 # Obsidian Echo Design System & layout specification
│
├── API & Security Protocols
│   ├── API.md                           # REST API reference, request/response schemas, error codes
│   ├── backend/API_AUTH_DOCUMENTATION.md# Authentication lifecycle, JWKS verification & token schemas
│   ├── backend/RATE_LIMITING_IMPLEMENTATION.md # Rate limiting architecture & window configuration
│   └── backend/ERROR_HANDLING_IMPLEMENTATION.md# Centralized error handler & status code mapping
│
├── Setup & Third-Party Integrations
│   ├── DEVELOPMENT.md                   # Local setup, npm scripts, testing & linting guide
│   ├── DEPLOYMENT.md                    # Production deployment, Docker Compose & reverse proxy
│   ├── GOOGLE_AUTH_SETUP.md             # Google Cloud OAuth 2.0 & OIDC step-by-step setup
│   ├── GOOGLE_AUTH_DEPLOYMENT_CHECKLIST.md # Pre-launch verification checklist for OAuth
│   └── SETUP_ELEVENLABS.md              # ElevenLabs Scribe v2 STT configuration & offline fallback
│
├── Testing & Verification Reports
│   ├── backend/TESTING.md               # Backend testing overview & Vitest configuration
│   ├── backend/UNIT_TESTS_SUMMARY.md    # Unit test suite results & coverage breakdown
│   ├── backend/INTEGRATION_TESTS_SUMMARY.md # End-to-end integration test execution logs
│   ├── backend/IMPLEMENTATION_CHECKLIST.md  # Security checkpoint & feature implementation audit
│   ├── frontend/HOOK_VERIFICATION.md    # React recording & playback hook test verification
│   └── frontend/TASK_2_COMPLETION_SUMMARY.md# UI redesign & component completion report
│
└── Governance, Community & Product
    ├── CONTRIBUTING.md                  # Contribution guidelines, branching & PR conventions
    ├── CODE_OF_CONDUCT.md               # Contributor Covenant Code of Conduct
    ├── SECURITY.md                      # Security policies, disclosure process & contact
    ├── CHANGELOG.md                     # Semantic version release notes
    ├── ROADMAP.md                       # Strategic engineering milestones
    ├── VISION.md                        # Product mission & architectural goals
    └── SUPPORT.md                       # Troubleshooting guide, FAQs & help channels
```

---

## 🚀 Quick Document Directory

### 1. Architecture & Core Systems
- **[System Architecture](ARCHITECTURE.md)**: Deep dive into the four-tier architecture (Client Tier, API Gateway Tier, Processing Tier, Storage Tier), component interfaces, and Mermaid sequence flows.
- **[Obsidian Echo Design System](design/DESIGN.md)**: High-contrast dark theme specifications, surface elevation levels, responsive 3-panel workspace layouts, and motion guidelines.

### 2. API & Security Specifications
- **[REST API Reference](API.md)**: Endpoint catalog including `/auth/*`, `/api/recordings/*`, `/api/pricing`, and `/health`, featuring payload validation schemas, HTTP status codes, and rate limits.
- **[Authentication Architecture](backend/API_AUTH_DOCUMENTATION.md)**: Cryptographic OIDC ID token verification against Google's JWKS, stateless HS256 JWT sessions, and JTI revocation.
- **[Rate Limiting Policy](backend/RATE_LIMITING_IMPLEMENTATION.md)**: Configuration details for `oauthLimiter` and `logoutLimiter`.
- **[Error Handling Protocol](backend/ERROR_HANDLING_IMPLEMENTATION.md)**: Standardized error responses and categorization utilities.

### 3. Developer & Operator Guides
- **[Local Development Guide](DEVELOPMENT.md)**: Setup instructions, preflight verification (`preflightCheck.js`), upload reconciliation (`syncUploads.ts`), and build commands.
- **[Production Deployment Manual](DEPLOYMENT.md)**: Bare-metal, Docker Compose, Nginx reverse proxy, and SSL/TLS configuration instructions.
- **[Google OAuth Setup](GOOGLE_AUTH_SETUP.md)**: Step-by-step instructions for Google Cloud Console OAuth consent screen, client IDs, and authorized redirect URIs.
- **[ElevenLabs Integration](SETUP_ELEVENLABS.md)**: Scribe v2 speech-to-text API key setup and mock fallback behavior.

### 4. Testing & Quality Assurance
- **[Testing Overview](backend/TESTING.md)**: Vitest, Supertest, and `fast-check` Property-Based Testing (PBT).
- **[Backend Unit Tests Summary](backend/UNIT_TESTS_SUMMARY.md)**: 197+ passing unit and integration tests.
- **[Frontend Hook Verification](frontend/HOOK_VERIFICATION.md)**: React hook test coverage (`useRecording`, `useRecordings`, `useTheme`).

### 5. Community & Project Governance
- **[Contributing Guide](CONTRIBUTING.md)**: Branch naming conventions, commit guidelines, and pull request workflow.
- **[Code of Conduct](CODE_OF_CONDUCT.md)**: Standards for a welcoming and inclusive community.
- **[Security Policy](SECURITY.md)**: Supported versions, vulnerability reporting channels, and response SLAs.
- **[Changelog](CHANGELOG.md)**: Chronological record of features, security patches, and structural updates.
- **[Roadmap](ROADMAP.md)**: Strategic engineering milestones.
- **[Vision](VISION.md)**: Long-term mission for conversational intelligence.
- **[Support & Troubleshooting](SUPPORT.md)**: Common questions, debugging tips, and issue labels.

---

[← Return to Project Root](../README.md)
