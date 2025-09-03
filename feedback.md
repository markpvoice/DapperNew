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
  - Remaining: remove stale `mobile-*` and legacy selectors across suites; centralize testid constants to avoid drift.
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
- Recommendations
  - Consider `next/image` for gallery thumbnails with `sizes` for CLS/LCP wins.
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

