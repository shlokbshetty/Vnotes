# Contributing to VNotes

Thank you for your interest in contributing to **VNotes**! This document outlines our branching conventions, commit message standards, pull request workflow, and required quality checks.

---

## 1. Branching Conventions

Create feature and bugfix branches off `main` using descriptive prefixes:

| Prefix | Purpose | Example |
| :--- | :--- | :--- |
| `feat/` | New user-facing features or API endpoints | `feat/speaker-diarization-export` |
| `fix/` | Bug fixes in frontend, backend, or auth flows | `fix/oauth-callback-race-condition` |
| `docs/` | Documentation updates and architecture diagrams | `docs/api-error-code-matrix` |
| `chore/` | Dependency upgrades, build scripts, or CI tasks | `chore/upgrade-vitest-v4` |
| `refactor/` | Internal code restructuring with no behavior change | `refactor/recording-service-types` |
| `test/` | Adding or expanding unit / `fast-check` PBT suites | `test/session-store-ttl-pbt` |

---

## 2. Conventional Commits Guidelines

All commit messages must follow the [Conventional Commits v1.0.0](https://www.conventionalcommits.org/) specification:

```text
<type>(<optional-scope>): <concise summary in imperative mood>

[optional body explaining why the change was made]

[optional footer(s) such as BREAKING CHANGE: or Closes #123]
```

### Allowed Commit Types
- `feat`: Introduces a new feature (`feat(backend): add WebVTT subtitle export endpoint`)
- `fix`: Patches a bug (`fix(auth): revoke jti claim on logout`)
- `docs`: Documentation-only changes (`docs: add comprehensive production documentation suite and architecture diagrams`)
- `style`: Formatting, ESLint fixes, whitespace
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance optimization
- `test`: Adding or updating Vitest / `fast-check` tests
- `chore`: Build scripts, `preflightCheck.js`, or dependency maintenance

---

## 3. Pull Request Lifecycle

1. **Fork & Branch**: Create a dedicated branch from the latest `main`.
2. **Implement & Test**:
   - Ensure any new backend service or middleware includes unit tests in `backend/tests/` and, where applicable, property-based tests (`*.pbt.test.ts`).
   - Ensure any new React component or route guard includes tests in `frontend/src/test/`.
3. **Run Pre-Commit Verification Checks** (all must pass with zero errors):
   ```bash
   # 1. Verify environment & Client ID parity
   npm run predev

   # 2. Lint backend and frontend
   npm --prefix backend run lint
   npm --prefix frontend run lint

   # 3. Run backend and frontend test suites
   npm --prefix backend test
   npm --prefix frontend test

   # 4. Verify production TypeScript & Vite build
   npm run build
   ```
4. **Submit Pull Request**: Fill out `.github/PULL_REQUEST_TEMPLATE.md` completely, linking related issues and confirming test coverage.
5. **Code Review & Merge**: Once approved by a maintainer and all CI checks pass, PRs are squash-merged into `main`.
