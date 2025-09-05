# Codebase & Test Suite Review — Observations and Recommendations

## Executive Summary
- Solid modern stack (Next.js 14, TS strict, Prisma, zod, Tailwind) with good security headers and useful docs.
- Recent improvements: auth cookies scoped correctly, booking API time handling, per-step form navigation, tailored copy, and updated E2E/unit tests.
- Remaining work: finish aligning E2E selectors, add a few focused API tests, and small UX/a11y polish items.

## Recent Improvements (Notable)
- Auth/login
  - Access token cookie path set to `/`; refresh token to `/api` to ensure `/api/admin/*` authenticate after login.
  - Demo hint corrected to `admin123!` (matches seed).
- Booking flow
  - POST `/api/bookings`: properly combines `eventDate` + `HH:MM` into Date; accepts `venueName`.
  - Client `createBooking` surfaces server error messages and normalizes `bookingId`.
  - Per-step navigation under each step; removed bottom-only nav friction.
  - Celebration copy tailored by step (final: “Ready to submit!”).
- Tests
  - Booking E2E aligned with modal flow and service-card testids; analytics/unavailable-date paths skipped until implemented.
  - Unit tests added: `bookings-post`, `bookings-get`, `rate-limiter`.
  - Contact E2E adapted to validate the contact section/landmarks.

## API & Data Layer
- Strengths
  - Clear separation of API route validation via zod; Prisma operations consolidated in `src/lib/database.ts`.
  - Rate limiter is db-backed with feature flag (`ENABLE_RATE_LIMIT`) and fail-open behavior.
- Recommendations
  - Add a couple of happy-path and edge-path tests for GET `/api/bookings/[id]` and PUT `/api/bookings/[id]` (status transitions and invalid IDs).
  - Standardize date handling (UTC vs. local) when checking “future date” across client and server; current checks are sensible but document intended timezone.
  - Consider idempotency keys (header or body) on booking POST to avoid duplicate submissions.

## Authentication
- Observations
  - Cookie scoping corrected; verify route auto-refreshes tokens when needed.
  - Admin dashboard relies on `/api/admin/*`; works post-fix.
- Recommendations
  - Add a tiny badge in admin header (e.g., “Signed in as …”) and simple logout to confirm state.
  - Optional: add a guard to redirect unauthenticated users to `/admin/login` from admin pages.

## Frontend UX & A11y
- Observations
  - Per-step nav greatly improves flow; success screen is clear and celebratory without being game-like.
  - Booking form uses labels, aria-invalid, aria-describedby, and aria-live for error feedback.
- Recommendations
  - Optional: add a subtle “sticky” mini-nav on small screens for extremely long steps.
  - Ensure focus management between steps (move focus to first invalid field on validation failure).
  - Add a “Skip to content” link and confirm all landmark roles on the homepage.

## Testing Status
- Unit
  - New suites for `/api/bookings` POST/GET and rate limiter add good coverage of critical logic.
  - Suggest adding tests for `/api/bookings/[id]` CRUD and small tests for `src/lib/api.ts` functions (success + error branches).
- E2E (Playwright)
  - Booking flow now matches modal-based UI and service-card selectors.
  - Contact E2E reflects current content model (no form yet).
  - Helpers present under `tests/e2e/helpers` for navigation and auth — great start toward centralization.
  - Remaining: finish removing stale `mobile-*` and legacy selectors across all suites; extract shared testid constants to helpers for consistency.
- CI
  - Recommend a PR pipeline with: `typecheck`, `lint`, `jest --coverage`, and a light E2E smoke.

## Security & Config
- Observations
  - Headers/CSP are solid and environment-aware; good coverage in `tests/unit/security/*`.
- Recommendations
  - Keep `.env.example` up to date (now includes `FROM_EMAIL`, `VERIFIED_EMAIL`, `ENABLE_RATE_LIMIT`). Consider uncommenting `TEST_DATABASE_URL` when adding DB-backed integration tests.

## Performance
- Observations
  - Particle and celebration animations respect `prefers-reduced-motion`; IntersectionObserver usage is good.
  - `next/image` already used in several components (service cards, optimized image, photo gallery lightbox).
- Recommendations
  - Switch gallery grid thumbnails from `<img>` to `next/image` with proper `sizes` and low‑quality placeholders to reduce CLS/LCP.
  - Lazy-load heavy admin widgets below-the-fold (charts, analytics) with `next/dynamic`.

## Quick Fix Checklist
- [x] Align availability API client (`month/year`)
- [x] Use `eventStartTime`/`eventEndTime` + combine with date in API
- [x] Move per-step nav buttons under content
- [x] Tailor celebration copy (final: “Ready to submit!”)
- [x] Fix auth cookie scoping; correct demo credentials hint
- [x] Add tests: bookings POST/GET, rate limiter; update booking E2E
- [ ] Add tests: bookings by ID (GET/PUT) and `src/lib/api.ts`
- [ ] Finish pruning stale E2E selectors; centralize testid constants
- [ ] Consider `next/image` for galleries; lazy-load heavy admin widgets
- [ ] Add admin auth guard + small signed-in badge (optional)

## Nice-to-Haves
- Add idempotency support on booking POST to prevent dupes on retries.
- Add a “print/save” option on Review step and subtle autosave “Saved” confirmation.
- Add a seeded Playwright fixture layer for deterministic unavailable-date scenarios.

---

## Additional Findings (Deep Dive Code + Test Harness Review)

- Architecture: Clear layering (API routes → lib/database|db|email|auth) with zod validation and Prisma usage. Good separation of client API utils in `src/lib/api.ts` vs server API routes.
- Security: Strong, environment-aware headers in `next.config.js` with comprehensive tests under `tests/unit/security/*`. Note that `X-XSS-Protection` is obsolete in modern Chromium; you can keep it for legacy coverage since tests expect it, but consider documenting that it’s legacy.

### High-Priority Fixes
- Duplicate hooks (naming/casing): `src/hooks` contains both hyphen-case and camelCase variants for the same concepts (e.g., `use-mobile-optimizations.ts` and `useMobileOptimizations.ts`, `use-touch-gestures.ts` and `useTouchGestures.ts`). This is error-prone on case-insensitive filesystems and creates import ambiguity. Action: consolidate to one canonical filename scheme (recommend kebab-case) and remove duplicates; update imports accordingly.
- Missing devDependencies used in tests:
  - `identity-obj-proxy` is referenced in `jest.config.js` for CSS Modules mapping but is not listed in `devDependencies`. Action: add it or remove that mapping if guaranteed unused.
  - `@tanstack/react-query` is imported in `tests/utils/test-utils.tsx` but not in dependencies. If you intend to use the custom render wrapper, add the dependency; if not, remove the unused provider to avoid accidental breakage if the helper gets imported.
- Test setup duplication and potential conflicts:
  - `jest.setup.js` defines polyfills/mocks for `Request`, `Response`, `Headers`, `next/navigation`, etc. `tests/setup.ts` re-implements many similar mocks/utilities but is not wired into Jest. Action: choose a single canonical setup (likely `jest.setup.js`), and either delete or clearly deprecate `tests/setup.ts` to avoid confusion. If you want the helper utilities there, export them from a `tests/utils` module and import from tests as needed.

### Medium-Priority Improvements
- Auth module import-time throw: `src/lib/auth.ts` throws if `NEXTAUTH_SECRET` is missing at import time. That’s brittle for certain runtime tools and ad-hoc REPL usage. Action: validate the env inside exported functions and fail fast there, or gate the top-level check behind a clear dev error that doesn’t crash test discovery.
- DB lifecycle hooks: `src/lib/db.ts` registers `process.on(...)` handlers and calls `process.exit(0)` in a shutdown path. In a Next.js environment (especially serverless), exiting the process is undesirable. Action: guard registration by runtime (Node server only), and avoid calling `process.exit`—let the platform manage lifecycle. Consider moving signal handling to a CLI/tooling layer rather than a library imported by route handlers.
- Client API utils error normalization: In `src/lib/api.ts#createBooking`, you default `success` to true when JSON parsing fails, which can mask backend issues. Tests rely on this today, but consider returning a clear failure for malformed JSON to avoid false positives in production.
- Permissions-Policy: The directive `interest-cohort=()` is fine for blocking FLoC; new Chromium privacy features may use different names (e.g., Topics). Consider adding a short comment that this is intentional for FLoC and revisit when updating browser support.
- Email templates: `src/lib/email.ts` builds HTML strings inline. For maintainability and safety, consider React Email components for templates and centralized sanitization. You already have `@react-email/render` in tests; aligning implementation with template rendering will make tests more realistic and content easier to iterate on.
- Test IDs consistency: You have `src/constants/test-ids.ts`, but many components hardcode `data-testid` strings. Action: gradually refactor hot paths to consume the constants to prevent selector drift.

### Test Harness Notes
- Jest configuration:
  - `globals.ts-jest` appears in `jest.config.js` even though `ts-jest` isn’t used with `next/jest`. It’s harmless but redundant; consider cleaning it up.
  - Coverage: global threshold 80% is reasonable. Ensure `collectCoverageFrom` excludes server-only boilerplate you don’t plan to test to avoid noisy coverage gating.
- Playwright E2E:
  - `webServer` runs `npm run dev`. For CI stability, prefer `next build && next start` on a dedicated port. Dev server is fine locally, but CI flakiness tends to be higher with HMR.
  - `tests/e2e/global-setup.ts` is currently a stub. When ready, wire Prisma migrations/seeds against `TEST_DATABASE_URL` and consider using fixtures for deterministic data.
  - Reporters and artifacts are well configured (HTML, JSON, JUnit, screenshots/videos on failure). Nice.
- Utilities and mocks:
  - The utilities in `tests/utils/test-utils.tsx` are handy but currently unused by suites. Either adopt the custom `render` wrapper where appropriate (forms, theming) or slim the helper to avoid stale dependencies.
- Scripts:
  - `test-working.js` is a convenient local filter. Consider adding a `npm run test:focus` script that accepts a glob or pattern to avoid an ad-hoc Node script.

### API and Data Layer Observations
- Rate limiter: Solid DB-backed limiter with feature-flag modes and fail-open behavior. Tests are good. Ensure `.env.example` documents `ENABLE_RATE_LIMIT` and defaults.
- Database ops: Validation via zod, transactional delete with calendar cleanup, and query helpers in `db.ts` are all good. Consider extracting DTOs and response types used across API and lib for stronger compile-time safety.
- Date/time semantics: API combines `eventDate` with `HH:MM` strings nicely. Document timezone assumptions (local vs UTC) in `API_DOCUMENTATION.md` to avoid confusion in cross-timezone bookings.

### Quick Wins Checklist (Actionable)
- Standardize hook filenames and remove duplicates.
- Add `identity-obj-proxy` and (if needed) `@tanstack/react-query` to devDeps, or remove unused references.
- Consolidate Jest setup into one file; delete or migrate `tests/setup.ts`.
- Replace import-time env throw in `auth.ts` with in-function validation.
- Guard DB process signal handlers and avoid `process.exit` inside library code.
- Adopt `TEST_IDS` constants in more components and tests.
- Switch Playwright CI to `build + start` flow and wire real DB setup when ready.

If you want, I can turn these into concrete TODOs or a short PR plan next.
