# Dapper Squad Entertainment — Codebase & UX Review

This review highlights strengths and offers prioritized, actionable recommendations across security, performance, accessibility, UX, and developer experience. Focus is on “delightful UX” with production-ready practices.

## Updates Since Last Review
- Mobile navigation: New `src/components/ui/mobile-drawer.tsx` adds an accessible, touch-optimized drawer with backdrop closing, ESC handling, focus management, and body scroll lock. Nice work and a solid step toward delightful mobile UX.
- Image optimization: New `OptimizedImage` wrapper and usage of Next `Image` in `service-card` and `video-testimonials` are great. The main gallery still uses `<img>`; consider migrating it to `Image` or to `OptimizedImage` for consistent performance benefits.
- Config/security: CSP in `next.config.js` still includes `'unsafe-eval'` and `'unsafe-inline'`; no HSTS/Permissions-Policy headers yet. Cookies remain `sameSite: 'lax'` without `/admin` scoping.
- Toast UX: `TOAST_REMOVE_DELAY` remains ~16.7 minutes; consider a 4–6s default with an explicit sticky option.
- Rate limiting: `rate-limiter.ts` still marked TODO for DB persistence; applied on login only. Consider contact/booking too once table exists.
- Caching: API routes use `export const dynamic = 'force-dynamic'` in many endpoints, but responses generally don’t set `Cache-Control: no-store` for authenticated/admin data.
- TypeScript: `tsconfig.json` still targets `es5` with `allowJs: true`.

## Highlights
- Robust API validation with Zod, consistent error responses, and thoughtful auth flows (access/refresh tokens).
- Clean Next.js 14 app router structure; strong separation across `app`, `components`, `hooks`, `lib`, and `types`.
- Solid Prisma client setup with connection health checks and query helpers.
- Thoughtful UX touches: animated CTAs respecting prefers-reduced-motion, keyboard support in calendar and gallery, clear empty/loading states.
- Comprehensive testing setup: Jest + Testing Library + Playwright, with good mocks and environment scaffolding.
- SEO metadata well-populated (OpenGraph, Twitter, `metadataBase`), and Tailwind system with utility helpers.

## Top Priorities
- Security headers and CSP tightening (production): remove `unsafe-inline`/`unsafe-eval`, add HSTS and modern cross-origin headers.
- Rate limiting: back your placeholder implementation with a DB table to actually enforce limits on auth/contact endpoints.
- Token cookies: consider `SameSite=strict` for admin cookies and path scoping; evaluate legacy `auth-token` removal plan.
- Toast UX: auto-dismiss far sooner; current 1,000,000 ms (~16.7 min) risks sticky toasts and user friction.
- Image performance: you’ve added `OptimizedImage` and some `next/image` usage — extend this to gallery/hero for full LCP gains (opt-in blur, sizes, priority).

## Security & Privacy
- CSP in `next.config.js`:
  - Current: `script-src` includes `'unsafe-eval' 'unsafe-inline'` and global `style-src 'unsafe-inline'`.
  - Recommendation (prod):
    - Remove `'unsafe-eval'` and `'unsafe-inline'` for scripts; use nonces or hashed inline snippets if truly needed.
    - Prefer CSS modules/Tailwind over inline styles; if unavoidable, use CSP hashes.
    - Expand `connect-src` to include only required domains (e.g., Stripe/Resend) and consider environment-driven lists.
- Add missing defense-in-depth headers:
  - Strict-Transport-Security: `max-age=31536000; includeSubDomains; preload`.
  - Permissions-Policy: explicitly disable camera/mic/geolocation unless used.
  - Cross-Origin-Opener-Policy: `same-origin`.
  - Cross-Origin-Resource-Policy: `same-origin` or `same-site`.
  - X-DNS-Prefetch-Control: `off` (or on, if desired, but declare it).
- Cookies:
  - `httpOnly` and `secure` are set — good.
  - Consider `sameSite: 'strict'` for admin tokens and scoping to `path: '/admin'` if tokens never needed elsewhere.
  - Plan deprecation of legacy `auth-token` to reduce surface area.
- Auth implementation:
  - Reuse of `NEXTAUTH_SECRET` for custom JWTs is fine but consider a separate `JWT_SECRET` for clarity; ensure environment parity across environments.
  - Refresh flow looks solid; ensure rotation on refresh is desired (currently re-issues both tokens).
- Rate limiting:
  - Implement `rateLimitAttempt` table to activate `checkRateLimit`/`clearRateLimit` — apply on login, contact, and booking creation routes.
- Secrets hygiene:
  - Ensure `.env.local` is never committed in public repos. Validate `.gitignore` is effective and CI uses secrets from the environment.

## API & Data Layer
- Input schemas:
  - Where clients may send numeric strings (e.g., `guestCount`), use `z.coerce.number()` to be resilient while still validating.
  - `eventStartTime`/`eventEndTime` parsing from plain strings to `Date` may be ambiguous (time-only vs. date-time). Prefer ISO with explicit timezone or pair times with `eventDate` server-side.
- Pagination & queries:
  - GET bookings returns `total` as `bookings.length` of the current page. If you need real totals, use `count()` alongside `findMany` with filters.
  - Consider cursor-based pagination for admin lists with stable ordering.
- Caching:
  - Ensure sensitive admin endpoints are not cached; add `Cache-Control: no-store` on authenticated API responses.
- Errors:
  - Maintain structured error shapes consistently; you already do this well.

## Frontend UX & Accessibility
- Toasts (`src/hooks/use-toast.tsx`):
  - `TOAST_REMOVE_DELAY = 1000000` (≈16.7 min). Change to 4–6 seconds for standard notifications; keep sticky toasts opt-in via a prop.
  - Consider queueing multiple toasts or increasing `TOAST_LIMIT` while avoiding overwhelm.
- Images:
  - Good start with `OptimizedImage` and selective `next/image` usage. Migrate `PhotoGallery` thumbnails and lightbox to `Image` or to `OptimizedImage` for responsive `sizes`, blur placeholders, and native lazy loading.
  - Ensure `next.config.js` `images.remotePatterns` covers all remote sources used by IG/CDN media.
- Mobile navigation:
  - Mobile drawer implements backdrop close, ESC support, body scroll lock, and initial focus — great. Add explicit focus trap (looping Tab within the drawer) and return focus to the trigger on close for full a11y polish.
- Calendar:
  - Great keyboard support and ARIA labeling. Consider locale-driven first-day-of-week and timezone-safe comparisons for “past date”.
  - Provide a non-color-only indicator for availability (icons or patterns) to support low-vision users; you already include text in tooltips — good.
- Forms:
  - Ensure server-side inclusive validation messages mirror zod errors; map into accessible inline hints with `aria-describedby`.
  - Consider saving form progress in `localStorage` for the multi-step flow (opt-in).
- Copy & micro-interactions:
  - Current copy is crisp and friendly. Consider explicit pricing tiers or “from $X” for fewer back-and-forths.
  - Keep animated effects gated by `prefers-reduced-motion` (already done — great).

## Performance
- Images and LCP:
  - Hero and above-the-fold images should use `priority` and proper `sizes`; evaluate preloading hero fonts.
- Bundles:
  - Inspect bundle via `next build` stats; consider splitting admin-only components and large charts to dynamic imports with `suspense`.
  - Where suitable, use `dynamic(() => import(...), { ssr: false, loading: ... })` for chart-heavy views to defer cost off the landing page.
- CSS & Tailwind:
  - Purge is built-in; avoid stray custom CSS where Tailwind suffices to reduce inlined styles that complicate CSP.
- Database:
  - `db.ts` adds process signal handlers; in serverless platforms these may not run predictably. Gate by environment or deployment target to avoid noisy logs.

## Emails
- Resend integration is defensive and dev-safe (verified recipients) — good.
- Consider moving templates to `react-email` components for consistency, reusability, and better testing across clients.
- Add DKIM/SPF/DMARC documentation in README for reliable delivery; ensure `FROM_EMAIL` domain matches configured identities.

## Testing & CI
- Tests are numerous and well-organized. To make them actionable:
  - Add CI workflows (GitHub Actions) for: lint + typecheck + unit + e2e (optionally) on PRs; cache Playwright browsers.
  - Include `format:check` in CI to keep the repo tidy.
  - Consider per-package scripts for faster targeted runs (e.g., only API tests on API changes).
  - Add a job to enforce security headers (CSP/HSTS) via an integration test or a small header-check utility in CI.

## Developer Experience
- TypeScript config:
  - Target is `es5`. With Next 14, safe to raise to `ES2020+` for better output and faster builds.
  - `allowJs: true` can be `false` if the codebase is TypeScript-only.
- Path aliases are clean; ensure IDE configs (VSCode) align for import resolution.
- Pre-commit hooks:
  - You have Husky + lint-staged configured — great. Add `typecheck` optionally on commit or at least on CI.

## SEO & Analytics
- Metadata is strong. Consider:
  - Add `og:image:alt` (present via OpenGraph) and ensure absolute URL generation works with `metadataBase` for all routes.
  - Structured data (JSON-LD) for LocalBusiness/Event on key pages to improve discovery.
  - Add basic analytics (privacy-friendly or GA4) with consent management, if desired.

## Quick Wins Checklist
- [ ] Tighten CSP, add HSTS and modern cross-origin headers.
- [ ] Implement DB-backed rate limiter table and enable it for login/contact.
- [ ] Reduce toast auto-dismiss to ~5s, allow sticky via prop.
- [ ] Extend `next/image`/`OptimizedImage` to gallery and hero with `sizes` + blur.
- [ ] Add explicit focus trap and return-focus behavior to mobile drawer.
- [ ] Use `z.coerce.number()` for numeric query/body fields that may arrive as strings.
- [ ] Add `Cache-Control: no-store` for authenticated API responses.
- [ ] Introduce GitHub Actions to run lint, typecheck, unit, and e2e tests.
- [ ] Consider `SameSite=strict` and scoping cookies to `/admin`.
- [ ] Raise TS target to `ES2020+`; consider disabling `allowJs`.

## Notable Strengths Worth Preserving
- Clear component APIs, consistent naming, and strong a11y patterns (keyboard support, ARIA, reduced motion).
- Defensive server patterns (validation, error handling, and email service fallbacks).
- Testing discipline across unit, integration, and e2e.

If you’d like, I can follow up by drafting concrete diffs for the CSP/header hardening, a Prisma migration for rate limiting, and a minimal CI workflow file — or implement the image optimizations in `PhotoGallery` behind a feature flag.
