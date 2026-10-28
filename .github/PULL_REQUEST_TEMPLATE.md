## Description

Provide a concise summary of the changes introduced in this Pull Request and the motivation behind them.

## Related Issue(s)

Closes #

## Type of Change

- [ ] `feat`: New feature (non-breaking change that adds functionality)
- [ ] `fix`: Bug fix (non-breaking change that fixes an issue)
- [ ] `docs`: Documentation or architecture diagram update
- [ ] `refactor`: Code restructuring without behavior change
- [ ] `test`: Addition or update of Vitest / `fast-check` property-based tests
- [ ] `chore`: Build scripts, `preflightCheck.js`, or dependency updates
- [ ] `BREAKING CHANGE`: Change that alters existing API contracts or environment requirements

## Test Coverage & Verification Checklist

- [ ] `npm run predev` passes with zero environment or Client ID parity errors
- [ ] `npm --prefix backend run lint` and `npm --prefix frontend run lint` pass with zero warnings/errors
- [ ] `npm --prefix backend test` and `npm --prefix frontend test` pass
- [ ] Added or updated unit and/or `fast-check` property-based tests (`*.pbt.test.ts`) for modified logic
- [ ] `npm run build` compiles both `backend/dist` and `frontend/dist` cleanly
- [ ] Updated relevant documentation (`README.md`, `docs/API.md`, `docs/ARCHITECTURE.md`) if routes or configuration changed

## Self-Review Checklist

- [ ] No secrets, API keys, or `.env` files are committed
- [ ] All protected backend endpoints enforce `authMiddleware` and verify `recording.user_id === req.userId`
