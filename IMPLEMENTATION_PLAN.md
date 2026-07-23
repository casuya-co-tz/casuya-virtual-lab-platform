# CASUYA - IMPLEMENTATION PLAN v11

> Phase 11: Labs & monitoring — loading skeletons, DOMPurify sanitization, web-vitals.
> Last updated: 2026-07-21

---

## WORK ITEMS

### P0 - Error boundary

- [x] `src/app/error.tsx` — Client error boundary with 500 display and retry button

### P1 - CI/CD

- [x] `.github/workflows/ci.yml` — Lint + build on push/PR

### P2 - Testing infrastructure

- [x] `vitest.config.ts` — Vitest config for unit tests
- [x] `src/lib/__tests__/lab-processor.test.ts` — 9 tests for sanitizeLabCode + computeSecurityScore
- [x] `package.json` — Added `test` and `test:watch` scripts

### P3 - Docker

- [x] `Dockerfile` — Multi-stage production build
- [x] `.dockerignore` — Excludes node_modules, .next, .git, etc.

### P4 - Language persistence

- [x] `src/hooks/useLanguage.ts` — Added localStorage persistence, `lang` attribute on `<html>`

### P5 - Rate limiter middleware fix

- [x] `src/middleware.ts` — Added `RATE_LIMIT_CONFIG` map to use all defined limiters; `/api/v1/public` bypasses key auth

### P6 - Public API route

- [x] `src/app/api/v1/public/route.ts` — Free tier endpoint (no key required, 30 req/min)

### P7 - i18n payment page

- [x] `src/lib/i18n.ts` — Added 15 EN + 15 SW payment translation keys (checkout, processing, success, error)
- [x] `src/app/payment/page.tsx` — Full i18n overhaul with `useLanguage()` and `t()` calls throughout

### P8 - i18n full page expansion

- [x] `src/lib/i18n.ts` — Added 100+ new EN+SW translation keys (admin tables, auth, dev, profile)
- [x] `src/app/admin/page.tsx` — Full i18n (stats, table headers, status labels)
- [x] `src/app/admin/labs/page.tsx` — Full i18n (table, buttons, confirm dialogs)
- [x] `src/app/admin/users/page.tsx` — Full i18n (table, role toggle)
- [x] `src/app/admin/billing/page.tsx` — Full i18n (empty state)
- [x] `src/app/admin/settings/page.tsx` — Full i18n (form, table)
- [x] `src/app/admin/audit/page.tsx` — Full i18n (filter, table, pagination)
- [x] `src/app/admin/api-keys/page.tsx` — Full i18n (heading)
- [x] `src/app/admin/docs/page.tsx` — Full i18n (headings, empty state)
- [x] `src/app/admin/analytics/page.tsx` — Full i18n (stat cards, table)
- [x] `src/app/admin/labs/new/page.tsx` — Full i18n (form, labels, buttons)
- [x] `src/app/admin/labs/[id]/page.tsx` — Full i18n (form, labels, buttons)
- [x] `src/app/auth/page.tsx` — Full i18n (mode switching, form labels, errors)
- [x] `src/app/auth/recovery/page.tsx` — Full i18n (headings, form, status)
- [x] `src/app/developer/page.tsx` — Full i18n (portal, stats, keys table, create flow)
- [x] `src/app/student/profile/page.tsx` — Full i18n (headings, form, labels)

### P9 - API completeness

- [x] `src/app/api/lab-progress/route.ts` — GET (single + all) and POST (upsert) for lab progress
- [x] `src/app/api/v1/enterprise/keys/[id]/revoke/route.ts` — Enterprise key revocation endpoint
- [x] `src/app/api/payments/tigo/route.ts` — Tigo Pesa webhook endpoint
- [x] `public/js/three.min.js` — Three.js r128 library (603 KB) for 3D lab simulations

### P10 - Monitoring & security audit

- [x] `src/app/api/vitals/route.ts` — POST (collect web vitals LCP/FID/CLS/TTFB) + GET (recent samples)
- [x] `src/lib/audit-logger.ts` — Reusable audit logging utility for security events (login_failed, login, signup, etc.)
- [x] `src/app/api/auth/login/route.ts` — Audit logging on login success and failure
- [x] `src/app/api/auth/signup/route.ts` — Audit logging on new registration

### P11 - CSP hardening

- [x] `public/js/init.js` — Externalized dark mode init + SW registration (was inline `<script>`)
- [x] `src/app/layout.tsx` — Removed inline script, removed `<meta>` CSP, uses `<script src="/js/init.js">`
- [x] `next.config.js` — Full CSP header on all routes (default-src, script-src, style-src, img-src, connect-src, font-src, frame-ancestors, form-action)
- [x] Hydration error fix: script no longer a direct child of `<html>`

### P12 - Sentry error tracking

- [x] `sentry.client.config.ts` — Client-side Sentry init with DSN, tracesSampleRate 1.0, PII scrubbing
- [x] `src/instrumentation.ts` — Server + edge runtime Sentry init via Next.js register()
- [x] `src/app/error.tsx` — Added `Sentry.captureException(error)` on mount
- [x] `src/app/global-error.tsx` — Root-level error boundary with isolated CSS + Sentry reporting
- [x] `next.config.js` — Wrapped with `withSentryConfig`, source maps, tunnel to /api/vitals
- [x] `@sentry/nextjs@10.67.0` — Installed and configured

### P13 - Labs & monitoring

- [x] `src/components/student/LabSkeleton.tsx` — Loading fallback for LabRunner dynamic import
- [x] `src/components/admin/EditorSkeleton.tsx` — Loading fallback for LabEditor dynamic import
- [x] `src/lib/lab-processor.ts` — Replaced regex sanitization with `sanitize-html` library (server-side, 15+ allowed tags)
- [x] `src/components/shared/WebVitals.tsx` — Client component collecting LCP, INP, CLS, TTFB via `web-vitals` library
- [x] `src/app/layout.tsx` — Added `<WebVitals />` to root layout
- [x] `package.json` — Added `sanitize-html`, `web-vitals`, `@types/sanitize-html`

### P14 - Full UI i18n & Auth Overhaul

- [x] `src/lib/db.ts` — Bypassed `@supabase/auth-helpers-nextjs` (which caused 500 errors) in favor of raw SQL and `sid` custom cookies.
- [x] UI strings refactored to use `useLanguage()` across the codebase: Teacher dashboard, Footer, Admin elements, home page voices, and static docs.

---

## COMPLETION LOG

| Date | Item | Status |
|------|------|--------|
| 2026-07-21 | error.tsx error boundary | Done |
| 2026-07-21 | GitHub Actions CI workflow | Done |
| 2026-07-21 | Dockerfile + .dockerignore | Done |
| 2026-07-21 | vitest config + first tests (9 passing) | Done |
| 2026-07-21 | useLanguage persistence fix | Done |
| 2026-07-21 | middleware rate limiter fix | Done |
| 2026-07-21 | api/v1/public free tier | Done |
| 2026-07-21 | Build verification (44 routes, tests pass) | Done |
| 2026-07-21 | Payment page i18n (EN+SW fully translated) | Done |
| 2026-07-21 | i18n expansion — all admin pages (11), auth (2), developer, profile — 16 pages total | Done |
| 2026-07-21 | Build verification (44 routes, 9 tests) after i18n overhaul | Done |
| 2026-07-21 | api/lab-progress route (GET single+all, POST upsert) | Done |
| 2026-07-21 | Enterprise key revocation endpoint | Done |
| 2026-07-21 | Tigo Pesa webhook endpoint | Done |
| 2026-07-21 | Three.js r128 downloaded to public/js/three.min.js (603 KB) | Done |
| 2026-07-21 | Build verification (47 routes, 9 tests) after Phase 7 | Done |
| 2026-07-21 | /api/vitals RUM endpoint (POST + GET) | Done |
| 2026-07-21 | Security audit logging — login, login_failed, signup events | Done |
| 2026-07-21 | Build verification (48 routes, 9 tests) after Phase 8 | Done |
| 2026-07-21 | CSP hardening — full policy header, inline script externalized to public/js/init.js | Done |
| 2026-07-21 | Layout cleanup — removed meta CSP tag, script moved into body, hydration error fixed | Done |
| 2026-07-21 | Build verification (48 routes, 9 tests) after Phase 9 | Done |
| 2026-07-21 | Sentry v10.67.0 installed + configured (client + server + edge) | Done |
| 2026-07-21 | Error boundaries updated — sentry.captureException in error.tsx + global-error.tsx | Done |
| 2026-07-21 | Build verification (49 routes, 9 tests) after Phase 10 | Done |
| 2026-07-21 | LabSkeleton + EditorSkeleton loading components | Done |
| 2026-07-21 | DOMPurify (sanitize-html) server-side HTML sanitization in lab-processor | Done |
| 2026-07-21 | WebVitals client library (LCP, INP, CLS, TTFB) integrated with /api/vitals | Done |
| 2026-07-21 | Build verification (49 routes, 9 tests) after Phase 11 | Done |
| 2026-07-23 | Auth overhaul — Bypassed @supabase/auth-helpers-nextjs due to 500 errors, implemented raw SQL & custom sid cookies | Done |
| 2026-07-23 | Full UI i18n Refactor — Teacher Dashboard, Admin API Key Manager, Voices From Tanzania, Footer, LivePreview, 404, Privacy, Terms, Docs | Done |
