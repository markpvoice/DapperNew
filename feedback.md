# Dapper Squad Entertainment — Codebase, UX, and Test Review

This document summarizes strengths and concrete recommendations across code quality, delightful UX, and testing (coverage and correctness). References include file paths and specific mismatches to accelerate fixes.

## Executive Summary
- Strong foundation: modern Next.js 14 + TypeScript, zod validation, Prisma data layer, Jest + Playwright, Tailwind, and security-forward Next headers/CSP.
- Tests: good breadth on security headers, DB layer, UI components; global Jest setup is robust.
- Recently addressed: availability API alignment (client now uses `month/year`), booking time field alignment (`eventStartTime`), added `data-testid="book-now-button"`, and significantly improved booking modal a11y (focus trap, aria attributes, focus restore, aria-hidden background).
- Remaining gaps: some E2E selector drift for post-submit success elements and mobile-flow assumptions, and missing tests for API route handlers and client API utilities.

---

## Highlights (What’s Working Well)
- TypeScript: `strict` on, path aliases, modern targets (`tsconfig.json`).
- Validation: Consistent zod schemas in API routes (e.g., `src/app/api/bookings/route.ts`).
- DX/Quality: ESLint + Prettier + husky + lint-staged in `package.json`; clear docs.
- Security: Strong, environment-aware headers/CSP in `next.config.js` and extensive tests in `tests/unit/security/*`.
- UI Components: Thoughtful accessibility in gallery and animated components; `PhotoGallery` provides roles, keyboard navigation, and lazy loading.
- Performance: Particle background honors `prefers-reduced-motion` and uses intersection observer for pause/resume.

---

## Key Issues To Address First
1) Resolved: API contract alignment
   - Client availability now calls `/api/bookings/availability?month=&year=` and checks the specific date’s membership in results (see `src/lib/api.ts`). Server endpoint remains month/year (good).
   - Client, types, and server now consistently use `eventStartTime`/`eventEndTime`.

2) E2E tests and UI selectors partially out of sync
   - Playwright opens the modal via `[data-testid="book-now-button"]` and asserts `[data-testid="booking-modal"]` — now aligned with the UI.
   - Remaining mismatches in tests: they still expect `[data-testid="booking-success"]` and `[data-testid="booking-reference"]` after submission. The UI shows `success-message` via `CelebrationService` and renders the reference as plain text without a testid.
   - The mobile responsiveness test still expects navigation to `/booking` and `mobile-*` selectors on the homepage, which do not exist.
   - Recommendation: update the E2E to use existing testids/text or instrument the UI with the expected testids; alternatively introduce a `/booking` route. Consider a shared constants file for testids to avoid future drift.

3) Modal accessibility/focus management (largely addressed)
   - `src/app/page.tsx` adds `role="dialog"`, `aria-modal`, `aria-labelledby`, background scroll lock, background `aria-hidden`, focus trap, and focus restoration. Nice work.
   - Optional: consider Radix Dialog for long-term maintenance, but the current implementation is solid.

4) Form UX and validation consistency
   - Client/server schema drift (above) and no immediate inline validation for some fields in earlier steps.
   - Recommendation: Share zod schemas (or a thin DTO layer) between client and server for parity; show inline validation with `aria-live="polite"` regions; add `inputmode`/`autocomplete` for email/phone/date fields.

---

## Delightful UX Improvements
- Navigation
  - Add a “Skip to content” link for keyboard users.
  - Mobile menu button: include `aria-expanded`, `aria-controls`, and focus management when opening/closing (`src/app/page.tsx`).

- Home Hero and CTAs
  - Consider a persistent mobile FAB (e.g., “Request Date”) that opens the booking modal; add `data-testid` for E2E stability.
  - Use `next/link` for in-page anchors to leverage smooth scrolling only when supported; degrade gracefully.

- Gallery
  - Consider Next.js `next/image` where appropriate for grid thumbnails to leverage responsive sizing and native lazy loading. Current `<img>` is fine for simplicity, but `next/image` will improve CLS/LCP when configured.

- Booking Modal
  - You’ve added a clear review step and solid progression; consider a print/save option on confirmation and explicit “Saved” status for autosave. Intelligent time suggestions based on event type remain a nice-to-have.

- Motion and Feedback
  - Great use of `prefers-reduced-motion` in `ParticleBackground`. Extend this to other animations (ripple/glow/celebration) by checking the same preference before heavy effects.

---

## Accessibility (A11y)
- Modal focus trap and labelling as noted above.
- Ensure error messages are announced via `aria-live` and inputs are linked with `aria-describedby` for errors.
- Add `role="navigation"` landmarks (header/nav/footer) and ensure page-level `h1` is unique per route.
- For icon-only buttons (e.g., close, menu), confirm accessible names are present and descriptive.

---

## Performance
- Images
  - Use `next/image` with properly set `sizes` for hero/gallery. Audit `public/images/*` to provide WebP/AVIF where available (Next already set to output these formats in `next.config.js`).
- Code-splitting
  - Consider dynamic imports for heavier admin components or animation-heavy modules, especially below-the-fold.
- Third-party scripts
  - Maintain the CSP discipline; load Stripe only where needed.

---

## Code Quality & Architecture
- API routes
  - Normalize date handling to avoid timezone pitfalls. Compare at start-of-day UTC or local consistently before “must be in the future” checks (`src/app/api/bookings/route.ts`).
  - Return 409 for “date unavailable” scenarios when applicable.
  - Consider idempotency keys (header or body) to prevent duplicate bookings on retry.

- Email
  - Good defensive handling of Resend responses in `src/lib/email.ts`. Add `.env.example` keys for `FROM_EMAIL`, `VERIFIED_EMAIL`, and `ENABLE_RATE_LIMIT` for clarity.
  - Sanitize or escape any user-provided strings interpolated into HTML; currently the templates are controlled but worth centralizing an escaping helper.

- Rate Limiting
  - Solid DB-backed rate limiter with fail-open. Add tests covering `ENABLE_RATE_LIMIT` modes (`true`, `log`, disabled) and the retry-after math.

---

## Testing System Review

### Jest (unit/integration)
- Config
  - `jest.config.js` is well-tuned (jsdom, moduleNameMapper, setup files). Coverage thresholds at 80% global are good.
  - Suggest per-package thresholds where critical (e.g., API and validation modules at 90%+, UI can be 70–80%).

- Setup
  - `jest.setup.js` provides JSDOM polyfills and mocks. Be careful overriding globals like `Request`/`Response`; document this so contributors understand why these mocks exist.

- Coverage Gaps (additions to consider)
  - API route handlers: Add tests for `GET/POST` in `src/app/api/bookings/*` using `NextRequest`/`NextResponse` with mocked `db` and `email` modules. Cover:
    - Valid/invalid payloads and query params
    - Rate limit enforced/log-only/disabled modes
    - Email failure paths (booking still succeeds)
    - Timezone edge cases for “future date” validation
  - Client API utilities (`src/lib/api.ts`): Unit tests mocking `fetch` via MSW or jest.fn to verify error handling and shape.
  - Rate limiter (`src/lib/rate-limiter.ts`): Unit tests for attempt counting, reset timing, and error/fail-open behavior.

### Playwright (E2E)
- Config is comprehensive with multi-browser projects, HTML/JUnit/JSON reporters, and dev server boot.
- Current status: opening the modal via `[data-testid="book-now-button"]` and asserting `[data-testid="booking-modal"]` is aligned with the UI.
- Remaining gaps: success/confirmation testids (`booking-success`, `booking-reference`) and mobile flow expectations (`/booking`, `mobile-*`) don’t match the current homepage implementation.
- Recommendations:
  - Update selectors or instrument the UI with matching testids; keep a small shared testids module to prevent drift.
  - Seed availability deterministically for unavailable-date scenarios.
  - Keep admin auth setup optional/skipped in CI unless admin flows are under test.

### CI, Stability, and Developer Feedback
- Add CI stages: `typecheck`, `lint`, `jest --coverage`, and optionally a smoke Playwright job on PRs.
- Enable a coverage summary output and surface in PR comments; optionally publish HTML coverage artifact.

---

## Documentation & Environment
- `.env.example`
  - Still recommend adding: `FROM_EMAIL`, `VERIFIED_EMAIL`, `ENABLE_RATE_LIMIT` (with explanatory comments about modes: `true`, `log`, disabled).
  - Consider `TEST_DATABASE_URL` if Playwright/integration tests will seed an isolated DB.

---

## Quick Fix Checklist
- [x] Standardize availability endpoint params (`month/year` in client and server).
- [x] Align booking time field names: `eventStartTime` across client/types/server.
- [ ] Sync remaining Playwright selectors with the UI (success and mobile cases) or instrument UI to match.
- [x] Add modal focus trap + focus restore and aria labelling.
- [ ] Add API route tests for `bookings` GET/POST with success/error/rate-limit paths.
- [ ] Add tests for `src/lib/api.ts` and `src/lib/rate-limiter.ts`.
- [ ] Extend `.env.example` with email/rate-limit keys.
- [ ] Investigate using `next/image` for gallery thumbnails (with correct sizes).

---

## Suggested Next Test Cases (Concrete)
- API POST /api/bookings
  - rejects past dates (timezone-stable), returns 400
  - accepts valid payload and returns 201 with booking reference
  - rate limit blocked with 429 + Retry-After when `ENABLE_RATE_LIMIT=true`
  - emails fail but booking still returns 201 (logs error)

- API GET /api/bookings/availability
  - validates missing params -> 400
  - validates out-of-range month/year -> 400
  - returns list for a seeded month -> 200 with expected `availableDates`

- Client API utils
  - `createBooking` returns `{ success:false }` on network error
  - `checkAvailability` constructs correct URL and parses response

- Rate limiter
  - allows N attempts within window; blocks N+1 with proper `retryAfter`
  - `log` mode never blocks but reports `remaining: 0`

---

If helpful, I can open a PR aligning the API contracts, fixing modal a11y, and adding the missing tests described here.
