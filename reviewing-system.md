# Review System — Implementation Status

## Implemented Features

| Feature | Status | Details |
|---------|--------|---------|
| Create review | ✅ | POST `/api/reviews` — authenticated users submit rating (1-5) + text |
| Read reviews (paginated) | ✅ | GET `/api/reviews?page=&limit=&sort=&order=&min_rating=` |
| Rating system | ✅ | 1–5 star with DB CHECK constraint |
| Visibility toggle | ✅ | `is_public` column — user chooses at submit, admin overrides |
| Public filter | ✅ | GET filters `WHERE is_public = true` |
| Admin view all (paginated) | ✅ | GET `/api/admin/reviews?page=&limit=&status=` |
| Admin moderation | ✅ | PATCH `/api/admin/reviews` — toggle visibility + audit logged |
| Admin delete | ✅ | DELETE `/api/admin/reviews/[id]` — permanent delete |
| Admin reports UI | ✅ | `/admin/reports` — list + resolve reports |
| Session auth | ✅ | POST requires `sid` cookie |
| Admin auth guard | ✅ | `requireAdmin()` on all admin routes |
| DB constraints | ✅ | `CHECK (rating 1-5)`, `NOT NULL`, FK cascade, defaults |
| i18n (EN + SW) | ✅ | All UI strings translated |
| Indexes | ✅ | `idx_reviews_is_public`, `idx_review_reports_resolved`, `idx_review_votes_review` |
| RLS policies | ✅ | Anyone SELECT, authenticated INSERT own |

## Newly Implemented Features (July 2026)

| # | Feature | What was built |
|---|---------|----------------|
| 1 | **Delete (own)** | DELETE `/api/reviews/[id]` — users delete their own reviews |
| 2 | **Delete (admin)** | DELETE `/api/admin/reviews/[id]` — admins delete any review |
| 3 | **Edit (time-window)** | PUT `/api/reviews/[id]` — users edit within 30 min window |
| 4 | **Pagination** | Both public & admin GET endpoints accept `?page=&limit=` |
| 5 | **Sorting / Filtering** | Public: `?sort=created_at|rating|helpful_count&order=asc|desc&min_rating=N`. Admin: `?status=public|private|all` |
| 6 | **Rate limiting** | POST `/api/reviews` — 5 reviews per hour per user (`SimpleRateLimiter`) |
| 7 | **Server-side validation** | Min 10 chars, max 2000 chars, HTML stripped via regex |
| 8 | **Shared TypeScript types** | `src/types/review.ts` — `Review`, `ReviewReport`, `CreateReviewInput`, `UpdateReviewInput`, `PaginationParams` |
| 9 | **Audit logging** | `logAuditEvent()` called on create, update, delete — `entityType: 'review'` added to audit-logger |
| 10 | **Reporting / Flagging** | POST `/api/reviews/[id]/report` — users report reviews. Admin resolves via PATCH `/api/admin/reports` |
| 11 | **Verified-reviewer badge** | Public GET joins `subscriptions WHERE status = 'active'` — shows "Verified" badge |
| 12 | **Helpful vote** | POST `/api/reviews/[id]/vote` — vote helpful/not helpful, toggle on re-click. Denormalized counts on `reviews` table |
| 13 | **Seed data** | 5 sample reviews (3 public, 1 private) inserted into database |
| 14 | **`updated_at` column** | Added to `reviews` table for edit tracking |
| 15 | **`helpful_count` / `not_helpful_count`** | Denormalized counters on `reviews` table |
| 16 | **`review_reports` table** | New table: id, review_id, reporter_id, reason, resolved_at, resolved_by |
| 17 | **`review_votes` table** | New table: id, review_id, user_id, helpful (boolean), UNIQUE per user+review |

## Not Implemented (Out of Scope)

| Feature | Reason |
|---------|--------|
| Email notifications | No SMTP infrastructure in project |
| Automated tests | Would require API route test infrastructure setup |
| Profanity filter | Basic HTML sanitization applied; full filter would need a library |

## File Inventory

| File | Role |
|------|------|
| `supabase/migrations/003_add_reviews.sql` | Base table + RLS |
| `supabase/migrations/006_add_review_visibility.sql` | `is_public` column + index |
| `supabase/migrations/007_review_enhancements.sql` | `updated_at`, helpful counts, `review_reports`, `review_votes` |
| `src/types/review.ts` | Shared TypeScript interfaces |
| `src/app/api/reviews/route.ts` | Public API (paginated GET, rate-limited POST) |
| `src/app/api/reviews/[id]/route.ts` | Edit (PUT), Delete (DELETE) own review |
| `src/app/api/reviews/[id]/vote/route.ts` | Helpful/not helpful vote |
| `src/app/api/reviews/[id]/report/route.ts` | Report a review |
| `src/app/api/admin/reviews/route.ts` | Admin API (paginated GET, PATCH visibility) |
| `src/app/api/admin/reviews/[id]/route.ts` | Admin delete |
| `src/app/api/admin/reports/route.ts` | Admin list + resolve reports |
| `src/app/admin/reviews/page.tsx` | Admin review management with pagination + delete |
| `src/app/admin/reports/page.tsx` | Admin reports queue |
| `src/components/home/VoicesFromTanzania.tsx` | Public review display with edit/delete/report/vote/verified |
| `src/lib/audit-logger.ts` | Added `'review'` to `AuditEntityType` |
| `src/lib/i18n.ts` | All review translations (EN + SW) |
| `src/lib/rate-limiter.ts` | Exported `SimpleRateLimiter` class |
| `src/components/layout/Sidebar.tsx` | Admin nav links (Reviews + Reports) |
| `src/components/layout/MobileDrawer.tsx` | Mobile nav links (Reviews + Reports) |
