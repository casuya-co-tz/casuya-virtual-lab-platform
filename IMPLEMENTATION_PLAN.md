# CASUYA - IMPLEMENTATION PLAN v16

> Phase 16: Security architecture hardening — iframe CSP, sync versioning, soft-delete, minor-unit ledger.
> Last updated: 2026-07-24

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
- [x] `src/app/api/payments/azampesa/route.ts` — AzamPesa webhook endpoint
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

### P15 - Security Hardening

- [x] `package.json` — Bumped postcss devDependency to `>=8.5.12`, added `overrides` to force all transitive deps to patched version (CVE-2026-45623: arbitrary file read via sourceMappingURL)
- [x] `scripts/run_migration.js` — Removed hardcoded database password (`Mkalanga1994!@`); now reads from `PGPASSWORD` environment variable with validation
- [x] `.env.local` — Removed leaked credential from plaintext, replaced with `changeme` placeholder
- [x] `.env.example` — Added `PG*` database connection variables for migration scripts
- [x] `.gitignore` — Verified sensitive files properly excluded (`supabase/config.toml`, `.env*`, `*.key`, `*.pem`, etc.)

### P16 - Security Architecture Hardening

- [x] `src/components/student/SimulationWrapper.tsx` — Removed `allow-same-origin` from iframe sandbox (critical security fix: prevented lab scripts from accessing parent cookies/session), added CSP meta tag injection into srcDoc
- [x] `src/components/admin/LivePreview.tsx` — Added CSP meta tag injection to admin preview iframe for consistency
- [x] `src/app/api/progress/route.ts` — Added server-side `sync_version` check: rejects stale client updates with HTTP 409 when `client_sync_version < server sync_version`
- [x] `supabase/migrations/005_security_hardening.sql` — Migration for integer minor-unit payments (prevents float drift), soft-delete columns on topics/subtopics/labs, RESTRICT foreign keys, cascade trigger, partial indexes
- [x] `src/app/api/topics/route.ts` — DELETE now sets `deleted_at = NOW()` instead of hard delete
- [x] `src/app/api/subtopics/route.ts` — DELETE now soft-deletes; GET filters out `deleted_at IS NOT NULL` records and joined parent records
- [x] `src/app/api/labs/[id]/route.ts` — DELETE now soft-deletes; GET filters out soft-deleted labs
- [x] `src/app/api/labs/route.ts` — Both admin and public GET queries filter `deleted_at IS NULL`
- [x] `src/app/api/labs/[id]/code/route.ts` — Code serving endpoint filters soft-deleted labs
- [x] `src/app/api/admin/stats/route.ts` — Stats counters exclude soft-deleted labs

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
| 2026-07-24 | Security: Patched postcss CVE-2026-45623 (arbitrary file read via sourceMappingURL) — bumped to >=8.5.12 with npm overrides | Done |
| 2026-07-24 | Security: Removed hardcoded DB password from scripts/run_migration.js — now reads PGPASSWORD from env | Done |
| 2026-07-24 | Security: Cleaned .env.local credential leak, updated .env.example with PG* variables | Done |
| 2026-07-24 | Security: Iframe CSP hardening — removed allow-same-origin, injected meta CSP into srcDoc (SimulationWrapper + LivePreview) | Done |
| 2026-07-24 | Security: Sync versioning — server-side staleness check on /api/progress (HTTP 409 on version mismatch) | Done |
| 2026-07-24 | Security: Soft-delete migration — deleted_at on topics/subtopics/labs, RESTRICT FKs, cascade trigger | Done |
| 2026-07-24 | Security: Integer minor-unit payments — converted NUMERIC(10,2) to INT8 minor units, CHECK constraints | Done |
| 2026-07-24 | Security: Updated all labs/topics/subtopics API routes to use soft-delete and filter deleted_at | Done |
| 2026-07-24 | PRING2 P0-1: AzamPesa real payment callback endpoint + status polling | Done |
| 2026-07-24 | PRING2 P0-2: Subscription expiry cron job (/api/cron/expire-subscriptions) | Done |
| 2026-07-24 | PRING2 P0-3: API key limit enforcement (server + UI) | Done |
| 2026-07-24 | PRING2 P1-1: Offline lab sync — service worker rewrite + IndexedDB offline-sync library + offline.html | Done |
| 2026-07-24 | PRING2 P1-2: Past paper mock practicals — DB migration + API + student UI | Done |
| 2026-07-24 | PRING2 P1-3: Performance reporting — vitals DB persistence + student progress page | Done |
| 2026-07-24 | PRING2 P1-4: Webhook system — DB migration + register/list/delete/deliveries API + dispatcher lib | Done |
| 2026-07-24 | PRING2 P1-5: Support ticketing — DB migration + create/list/message API + student + admin UI | Done |
| 2026-07-24 | PRING2 P2-1: Classroom provisioning — DB migration + teacher CRUD + student join API + UI | Done |
| 2026-07-24 | PRING2 P2-2: Uptime monitoring — health check API + incidents table + status page | Done |
| 2026-07-24 | PRING2 P2-3: API analytical engine — analytics API + CSV/JSON export + developer analytics page | Done |
| 2026-07-24 | PRING2 P2-4: Custom rate limits — DB migration + developer_profiles columns + sla-tracker lib | Done |
| 2026-07-24 | PRING2 P2-5: Assigned integration engineer — DB migration + admin assignment column | Done |
| 2026-07-24 | PRING2 P3-1: NECTA curriculum tagging — necta_topic/subtopic/level columns on labs table | Done |
| 2026-07-24 | PRING2 P3-2: Audit logging for pricing operations | Done |
| 2026-07-24 | PRING2 P3-3: AzamPesa transfer fee note — i18n key added | Done |
| 2026-07-24 | PRING2: 60+ new i18n keys (EN+SW) for support, past papers, progress, classrooms, analytics, status, offline | Done |
| 2026-07-24 | PRING2: Build verification — 83 routes, all compile successfully | Done |
