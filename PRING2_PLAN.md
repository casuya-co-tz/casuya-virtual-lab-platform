# PRING2 PLAN — Infrastructure Gap Analysis & Implementation Roadmap

> **Date:** 2026-07-24
> **Status:** PLANNING
> **Purpose:** Verify every pricing plan feature claim against actual infrastructure, then plan implementation of all missing pieces.

---

## EXECUTIVE SUMMARY

**Features claimed in pricing plans: 24**
**Truly supported (working): 6**
**Partially supported (stubbed/incomplete): 4**
**Missing entirely: 14**

The platform has a solid foundation (Next.js, Supabase, auth, labs, basic payments UI) but **many pricing plan features are marketing text backed by zero infrastructure**. This plan closes every gap.

---

## SECTION A: FEATURE VERIFICATION MATRIX

### For Students & Teachers

| # | Feature | Claimed In | Status | Evidence |
|---|---------|------------|--------|----------|
| 1 | Access to free foundational labs | All plans | ✅ WORKING | `labs` table with `is_published`, public GET endpoints, student lab viewer |
| 2 | Access to all NECTA-aligned labs | Basic+ | ⚠️ PARTIAL | Labs exist but no NECTA curriculum tagging. `is_premium` flag added but no labs flagged yet |
| 3 | Local offline sync for remote areas | Basic+ | ❌ MISSING | `sw.js` only caches 5 static routes. No IndexedDB, no lab data caching, no background sync |
| 4 | Past paper mock practicals | Basic+ | ❌ MISSING | Only i18n string `'pricing.features.examPrep'`. Zero implementation |
| 5 | Performance reporting | Pro+ | ❌ MISSING | Web vitals collected to in-memory buffer (lost on restart), no student/teacher dashboard |
| 6 | Direct tech team priority support | Pro+ | ❌ MISSING | No support ticketing system at all |
| 7 | Classroom provisioning controls | Pro (teachers) | ❌ MISSING | Only i18n string. No classroom model, no bulk enrollment, no class management |
| 8 | Uncapped institutional licenses | Institution | ❌ MISSING | `school_seats` table exists but no provisioning UI or seat management |
| 9 | API analytical engine exports | Institution (read) | ❌ MISSING | Basic `/api/v1/enterprise/usage` counter exists. No analytical engine, no CSV/JSON export |

### For Developers & Integrators

| # | Feature | Claimed In | Status | Evidence |
|---|---------|------------|--------|----------|
| 10 | API analytical engine exports | All dev plans | ⚠️ PARTIAL | `/api/v1/enterprise/usage` returns grouped counts. No export, no analytics |
| 11 | Up to 5 production API keys | Basic+ | ❌ NOT ENFORCED | `max_api_keys` in schema but credential creation endpoint never checks it |
| 12 | Unlimited production API keys | Enterprise | ❌ NOT ENFORCED | Same — no enforcement anywhere |
| 13 | Real-time webhook sync | Basic+ | ❌ MISSING | Only i18n string. No webhook registration, delivery, retry, or signing |
| 14 | Direct tech team priority support | Pro+ | ❌ MISSING | No support system |
| 15 | 99.9% uptime SLA | Pro (99.5%), Enterprise (99.9%) | ❌ MISSING | Hardcoded stat on homepage. Zero monitoring infrastructure |
| 16 | Assigned integration engineer | Enterprise | ❌ MISSING | Only i18n string. No assignment model |
| 17 | Custom high-throughput thresholds | Enterprise | ❌ MISSING | Only i18n string. `custom_rate_limits` column doesn't exist in schema |

### Payment Infrastructure

| # | Feature | Status | Evidence |
|---|---------|--------|----------|
| 18 | AzamPesa integration | ⚠️ STUBBED | UI exists, DB insert works, but no real gateway call, no callback webhook, no status polling |
| 19 | Subscription lifecycle | ⚠️ PARTIAL | Create/upgrade/cancel endpoints exist. No expiry cron, no renewal reminders |

---

## SECTION B: INFRASTRUCTURE GAPS TO BUILD

### Priority 0 — Critical (blocks revenue)

#### P0-1: AzamPesa Real Payment Gateway
**Why:** Without real payments, no plan generates revenue.

```
Implementation:
  1. Register AzamPesa merchant account (production credentials)
  2. Create POST /api/payments/azampesa/initiate
     - Call AzamPesa API with phone, amount, callback URL
     - Store provider_transaction_id in payment_transactions
  3. Create POST /api/payments/azampesa/callback (webhook receiver)
     - Verify SHA256 signature from AzamPesa
     - Update payment_transactions.status = 'completed'
     - Activate/update subscription (set expires_at = NOW() + interval)
  4. Create GET /api/payments/status/[id]
     - Poll AzamPesa API for transaction status
  5. Update payment/page.tsx to use real flow
  6. Add AzamPesa credentials to .env (AZAMPESA_MERCHANT_ID, AZAMPESA_API_KEY, AZAMPESA_SECRET)
```

**Files to create:**
- `src/app/api/payments/azampesa/callback/route.ts`
- `src/app/api/payments/status/[id]/route.ts`

**Files to modify:**
- `src/app/api/payments/azampesa/route.ts` — real gateway call
- `src/app/payment/page.tsx` — poll for status
- `.env.example` — AzamPesa credentials

#### P0-2: Subscription Expiry Cron
**Why:** Subscriptions never expire without a background job.

```
Implementation:
  1. Create POST /api/cron/expire-subscriptions (protected by CRON_SECRET)
     - UPDATE subscriptions SET status = 'expired' WHERE expires_at < NOW() AND status = 'active'
     - UPDATE subscriptions SET tier = 'free' WHERE status = 'expired'
  2. Schedule via Vercel Cron or external cron job (every hour)
  3. Add renewal reminder emails (optional, Phase 2)
```

**Files to create:**
- `src/app/api/cron/expire-subscriptions/route.ts`

#### P0-3: API Key Limit Enforcement
**Why:** Pricing promises "5 API keys" but developers can create unlimited.

```
Implementation:
  1. In POST /api/developer/credentials:
     - Query developer_profiles.plan_id → pricing_plans.max_api_keys
     - COUNT existing active credentials for this developer
     - If count >= max_api_keys, return 403 with upgrade URL
  2. In developer/page.tsx:
     - Fetch plan max_api_keys on load
     - Disable "New API Key" button when at limit
     - Show "Upgrade for more keys" link
  3. For unlimited (max_api_keys IS NULL), skip check
```

**Files to modify:**
- `src/app/api/developer/credentials/route.ts`
- `src/app/developer/page.tsx`

---

### Priority 1 — High (required for plan promises)

#### P1-1: Offline Lab Sync (Service Worker Upgrade)
**Why:** Basic/Pro plans promise "local offline sync for remote areas."

```
Implementation:
  1. Upgrade public/sw.js:
     - Cache lab simulation assets (HTML/JS/CSS from iframe srcDoc)
     - Add IndexedDB for lab progress offline queue
     - Implement background sync (SyncManager API)
  2. Create src/lib/offline-sync.ts:
     - saveLabOffline(labId, labData) — store in IndexedDB
     - queueProgressUpdate(labId, progress) — queue when offline
     - syncQueuedUpdates() — flush queue when online
  3. Update SimulationWrapper.tsx:
     - On lab load, cache simulation data in IndexedDB
     - On progress update, check navigator.onLine; if offline, queue
  4. Add offline indicator UI component
  5. Update manifest.json with offline fallback page
```

**Files to create:**
- `src/lib/offline-sync.ts`
- `src/components/shared/OfflineIndicator.tsx`
- `public/offline.html`

**Files to modify:**
- `public/sw.js` — major rewrite
- `public/manifest.json`
- `src/components/student/SimulationWrapper.tsx`
- `src/app/student/[subject]/[lab]/page.tsx`

#### P1-2: Past Paper Mock Practicals
**Why:** Basic+ plan promises "past paper mock practicals."

```
Implementation:
  1. Create DB migration: past_papers table
     CREATE TABLE past_papers (
       id UUID PRIMARY KEY,
       subject TEXT NOT NULL,
       year INT NOT NULL,
       paper_number INT NOT NULL,
       exam_body TEXT DEFAULT 'NECTA',
       questions JSONB NOT NULL,
       is_premium BOOLEAN DEFAULT true,
       sort_order INT DEFAULT 0,
       created_at TIMESTAMPTZ DEFAULT NOW()
     );
  2. Create seed script with sample NECTA-format questions
  3. Create GET /api/past-papers (list with subject/year filters)
  4. Create GET /api/past-papers/[id] (single paper)
  5. Create UI: src/app/student/past-papers/page.tsx
     - Subject filter tabs (Physics, Chemistry, Biology)
     - Year selector
     - Paper card grid
     - Mock practical mode (interactive lab with exam constraints)
  6. Add paywall: free users see limited papers, basic+ see all
```

**Files to create:**
- `supabase/migrations/008_past_papers.sql`
- `src/app/api/past-papers/route.ts`
- `src/app/api/past-papers/[id]/route.ts`
- `src/app/student/past-papers/page.tsx`
- `src/components/student/PastPaperCard.tsx`
- `src/components/student/MockPractical.tsx`

#### P1-3: Performance Reporting Dashboard
**Why:** Pro plan promises "performance reporting."

```
Implementation:
  1. Fix vitals persistence:
     - Create vitals table in DB (or use Supabase realtime)
     - INSERT INTO vitals on POST /api/vitals (replace in-memory buffer)
  2. Create GET /api/vitals/summary:
     - Aggregate by student_id: avg scores, completion rates, time spent
     - Group by subject, lab, time period
  3. Create teacher performance dashboard:
     - src/app/teacher/analytics/page.tsx
     - Class-wide performance charts (bar, line)
     - Student leaderboard
     - Subject completion rates
  4. Create student self-report:
     - src/app/student/progress/page.tsx
     - Personal stats cards
     - Lab completion timeline
     - Score trends
  5. Gating: free/basic see basic stats, pro+ see full analytics
```

**Files to create:**
- `supabase/migrations/009_vitals_persistence.sql`
- `src/app/api/vitals/summary/route.ts`
- `src/app/teacher/analytics/page.tsx`
- `src/app/student/progress/page.tsx`
- `src/components/shared/PerformanceChart.tsx`

**Files to modify:**
- `src/app/api/vitals/route.ts` — persist to DB

#### P1-4: Webhook System for Developers
**Why:** Basic+ dev plans promise "real-time webhook sync."

```
Implementation:
  1. Create DB migration:
     CREATE TABLE webhook_subscriptions (
       id UUID PRIMARY KEY,
       developer_id UUID REFERENCES developer_profiles(id),
       url TEXT NOT NULL,
       events TEXT[] NOT NULL,  -- ['lab.created', 'lab.updated', 'usage.threshold']
       secret TEXT NOT NULL,     -- HMAC signing key
       is_active BOOLEAN DEFAULT true,
       created_at TIMESTAMPTZ DEFAULT NOW()
     );
     CREATE TABLE webhook_deliveries (
       id UUID PRIMARY KEY,
       webhook_id UUID REFERENCES webhook_subscriptions(id),
       event TEXT NOT NULL,
       payload JSONB NOT NULL,
       status TEXT DEFAULT 'pending',  -- pending, delivered, failed
       attempts INT DEFAULT 0,
       last_attempt_at TIMESTAMPTZ,
       response_code INT,
       created_at TIMESTAMPTZ DEFAULT NOW()
     );
  2. Create API endpoints:
     POST /api/developer/webhooks — register webhook URL
     GET /api/developer/webhooks — list webhooks
     DELETE /api/developer/webhooks/[id] — delete webhook
     GET /api/developer/webhooks/[id]/deliveries — delivery logs
  3. Create webhook dispatcher:
     src/lib/webhook-dispatcher.ts
     - dispatchEvent(developerId, event, payload)
     - Sign payload with HMAC-SHA256
     - POST to registered URL
     - Retry up to 3 times with exponential backoff
     - Log to webhook_deliveries
  4. Trigger events:
     - On lab publish/update → 'lab.created' / 'lab.updated'
     - On usage threshold → 'usage.threshold_reached'
  5. Gating: free dev plan gets 0 webhooks, basic+ gets webhooks
```

**Files to create:**
- `supabase/migrations/010_webhooks.sql`
- `src/lib/webhook-dispatcher.ts`
- `src/app/api/developer/webhooks/route.ts`
- `src/app/api/developer/webhooks/[id]/route.ts`
- `src/app/api/developer/webhooks/[id]/deliveries/route.ts`

#### P1-5: Support Ticketing System
**Why:** Pro+ plans promise "direct tech team priority support."

```
Implementation:
  1. Create DB migration:
     CREATE TABLE support_tickets (
       id UUID PRIMARY KEY,
       user_id UUID REFERENCES profiles(id),
       subject TEXT NOT NULL,
       description TEXT NOT NULL,
       priority TEXT DEFAULT 'normal',  -- low, normal, high, urgent
       status TEXT DEFAULT 'open',       -- open, in_progress, resolved, closed
       assigned_to UUID REFERENCES profiles(id),
       plan_tier TEXT,  -- captured at creation for priority routing
       created_at TIMESTAMPTZ DEFAULT NOW(),
       updated_at TIMESTAMPTZ DEFAULT NOW()
     );
     CREATE TABLE ticket_messages (
       id UUID PRIMARY KEY,
       ticket_id UUID REFERENCES support_tickets(id),
       sender_id UUID REFERENCES profiles(id),
       message TEXT NOT NULL,
       is_internal BOOLEAN DEFAULT false,
       created_at TIMESTAMPTZ DEFAULT NOW()
     );
  2. Create API endpoints:
     POST /api/support/tickets — create ticket
     GET /api/support/tickets — list user's tickets
     GET /api/support/tickets/[id] — get ticket + messages
     POST /api/support/tickets/[id]/messages — add message
  3. Create UI:
     - src/app/support/page.tsx — ticket list + create
     - src/app/support/[id]/page.tsx — ticket detail + conversation
  4. Admin view:
     - src/app/admin/support/page.tsx — all tickets, filter by priority
  5. Priority routing:
     - Free/Basic → community (no tickets)
     - Pro → normal priority
     - Institution/Enterprise → high priority, SLA timer
```

**Files to create:**
- `supabase/migrations/011_support_tickets.sql`
- `src/app/api/support/tickets/route.ts`
- `src/app/api/support/tickets/[id]/route.ts`
- `src/app/api/support/tickets/[id]/messages/route.ts`
- `src/app/support/page.tsx`
- `src/app/support/[id]/page.tsx`
- `src/app/admin/support/page.tsx`

---

### Priority 2 — Medium (institutional/enterprise features)

#### P2-1: Classroom Provisioning & Management
**Why:** Institution plan promises "uncapped institutional licenses" + Pro teachers get "classroom provisioning controls."

```
Implementation:
  1. Create DB migration:
     CREATE TABLE classrooms (
       id UUID PRIMARY KEY,
       school_id UUID REFERENCES schools(id),
       teacher_id UUID REFERENCES profiles(id),
       name TEXT NOT NULL,
       class_code TEXT UNIQUE NOT NULL,  -- 6-char alphanumeric
       subject TEXT,
       max_students INT DEFAULT 40,
       created_at TIMESTAMPTZ DEFAULT NOW()
     );
     CREATE TABLE classroom_enrollments (
       id UUID PRIMARY KEY,
       classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
       student_id UUID REFERENCES profiles(id),
       enrolled_at TIMESTAMPTZ DEFAULT NOW(),
       UNIQUE(classroom_id, student_id)
     );
  2. Create API endpoints:
     POST /api/teacher/classrooms — create classroom
     GET /api/teacher/classrooms — list teacher's classrooms
     POST /api/teacher/classrooms/[id]/enroll — add student by code
     GET /api/teacher/classrooms/[id]/students — list enrolled students
     DELETE /api/teacher/classrooms/[id]/enroll/[studentId] — remove student
     POST /api/student/classrooms/join — join by class code
  3. Create UI:
     - src/app/teacher/classrooms/page.tsx — classroom list + create
     - src/app/teacher/classrooms/[id]/page.tsx — roster + student progress
     - Student: join classroom modal in dashboard
  4. Bulk enrollment: CSV upload for Institution plan
  5. Gating:
     - Free/Basic: no classroom features
     - Pro teachers: 1 classroom, 40 students
     - Institution: unlimited classrooms + students
```

**Files to create:**
- `supabase/migrations/012_classrooms.sql`
- `src/app/api/teacher/classrooms/route.ts`
- `src/app/api/teacher/classrooms/[id]/route.ts`
- `src/app/api/teacher/classrooms/[id]/enroll/route.ts`
- `src/app/api/teacher/classrooms/[id]/students/route.ts`
- `src/app/api/student/classrooms/join/route.ts`
- `src/app/teacher/classrooms/page.tsx`
- `src/app/teacher/classrooms/[id]/page.tsx`

#### P2-2: Uptime Monitoring & Status Page
**Why:** Enterprise plan promises "99.9% uptime SLA."

```
Implementation:
  1. Create health check endpoint:
     GET /api/health — returns { status: 'ok', uptime: process.uptime(), db: 'connected' }
  2. Create status page:
     src/app/status/page.tsx — public status page
     - Current system status (operational / degraded / down)
     - Last 90 days uptime percentage
     - Incident history
  3. Create DB table for incidents:
     CREATE TABLE incidents (
       id UUID PRIMARY KEY,
       title TEXT NOT NULL,
       description TEXT,
       status TEXT DEFAULT 'investigating',  -- investigating, identified, monitoring, resolved
       severity TEXT DEFAULT 'minor',         -- minor, major, critical
       started_at TIMESTAMPTZ DEFAULT NOW(),
       resolved_at TIMESTAMPTZ,
       updates JSONB DEFAULT '[]'
     );
  4. External monitoring:
     - Option A: UptimeRobot (free, 50 monitors) — ping /api/health every 5 min
     - Option B: Cron job + Supabase table for uptime logs
  5. SLA calculation:
     - Track total minutes in billing period
     - Track downtime minutes from incidents
     - Calculate uptime % = (total - downtime) / total * 100
  6. SLA breach alerting:
     - If uptime < 99.9% for enterprise customers, notify via support ticket
```

**Files to create:**
- `src/app/api/health/route.ts`
- `src/app/status/page.tsx`
- `supabase/migrations/013_incidents.sql`

#### P2-3: API Analytical Engine Exports
**Why:** Institution/Enterprise plans promise "API analytical engine exports."

```
Implementation:
  1. Enhance /api/v1/enterprise/usage:
     - Add time-range filtering (day/week/month)
     - Add endpoint breakdown with latency percentiles
     - Add error rate analysis
  2. Create export endpoints:
     GET /api/developer/analytics/export?format=csv
     GET /api/developer/analytics/export?format=json
     - Generate downloadable report
  3. Create analytics dashboard:
     src/app/developer/analytics/page.tsx
     - Usage over time (line chart)
     - Top endpoints (bar chart)
     - Error rate (pie chart)
     - Latency distribution (histogram)
     - Export buttons (CSV, JSON)
  4. Gating:
     - Free dev: basic usage counter only
     - Basic+: full analytics dashboard
     - Enterprise: export + custom date ranges + raw data access
```

**Files to create:**
- `src/app/api/developer/analytics/route.ts`
- `src/app/api/developer/analytics/export/route.ts`
- `src/app/developer/analytics/page.tsx`

#### P2-4: Custom Rate Limits (Enterprise)
**Why:** Enterprise plan promises "custom high-throughput thresholds."

```
Implementation:
  1. Add to developer_profiles:
     ALTER TABLE developer_profiles ADD COLUMN custom_rate_limit INT;
     ALTER TABLE developer_profiles ADD COLUMN custom_burst_limit INT;
  2. Modify enforceDeveloperQuota() in api-tracker.ts:
     - If custom_rate_limit IS NOT NULL, use it instead of plan default
  3. Admin UI:
     - In admin/billing, add "Custom Limits" column per developer
     - Allow admin to set custom rate/burst limits
  4. API endpoint:
     PUT /api/admin/developers/[id]/limits — set custom limits
```

**Files to modify:**
- `supabase/migrations/014_custom_limits.sql`
- `src/lib/api-tracker.ts`
- `src/app/admin/billing/page.tsx`

#### P2-5: Assigned Integration Engineer (Enterprise)
**Why:** Enterprise plan promises "assigned integration engineer."

```
Implementation:
  1. Add to developer_profiles or subscriptions:
     ALTER TABLE developer_profiles ADD COLUMN assigned_engineer_id UUID REFERENCES profiles(id);
  2. Admin UI:
     - In admin panel, show enterprise customers
     - Assign/unassign engineer to customer
  3. This is primarily an operational feature (assign a human), 
     but the system needs:
     - Engineer assignment model
     - Notification when assigned
     - Shared notes/tickets between engineer and customer
  4. Simplest MVP: just a column + admin dropdown
```

**Files to modify:**
- `supabase/migrations/014_custom_limits.sql` (combine)
- `src/app/admin/billing/page.tsx`

---

### Priority 3 — Low (polish & compliance)

#### P3-1: NECTA Curriculum Tagging
**Why:** "NECTA-aligned labs" promise.

```
Implementation:
  1. Add to labs table:
     ALTER TABLE labs ADD COLUMN necta_topic TEXT;
     ALTER TABLE labs ADD COLUMN necta_subtopic TEXT;
     ALTER TABLE labs ADD COLUMN necta_level TEXT; -- 'O-Level', 'A-Level'
  2. Admin UI: curriculum tagging in lab editor
  3. Student filter: browse by NECTA topic
```

#### P3-2: Admin Audit Logging for Pricing
**Why:** Security requirement for financial operations.

```
Implementation:
  1. In subscription upgrade/cancel endpoints:
     - Log to audit_log: action='subscription.upgrade', 'subscription.cancel'
  2. In admin pricing edits:
     - Log to audit_log: action='pricing.update'
```

#### P3-3: AzamPesa Transfer Fee Note
**Why:** "AzamPesa-to-AzamPesa: FREE" claim.

```
Implementation:
  1. Display note on payment page:
     "Transfers between AzamPesa numbers are free of charge"
  2. This is informational only — the payment gateway handles fees
```

---

## SECTION C: IMPLEMENTATION TIMELINE

### Week 1-2: Revenue-Critical (P0)
| Day | Task | Owner |
|-----|------|-------|
| 1-2 | AzamPesa merchant account registration | Business |
| 3-5 | P0-1: Real AzamPesa integration | Backend |
| 6-7 | P0-2: Subscription expiry cron | Backend |
| 8-10 | P0-3: API key limit enforcement | Full-stack |
| 11-14 | Payment flow end-to-end testing | QA |

### Week 3-4: Core Plan Features (P1)
| Day | Task | Owner |
|-----|------|-------|
| 15-17 | P1-1: Offline lab sync (SW rewrite) | Frontend |
| 18-21 | P1-2: Past paper mock practicals | Full-stack |
| 22-25 | P1-3: Performance reporting dashboard | Full-stack |
| 26-28 | P1-4: Webhook system | Backend |
| 29-30 | P1-5: Support ticketing system | Full-stack |

### Week 5-6: Enterprise Features (P2)
| Day | Task | Owner |
|-----|------|-------|
| 31-35 | P2-1: Classroom provisioning | Full-stack |
| 36-38 | P2-2: Uptime monitoring + status page | Backend |
| 39-41 | P2-3: API analytical engine exports | Full-stack |
| 42-43 | P2-4: Custom rate limits | Backend |
| 44-44 | P2-5: Integration engineer assignment | Full-stack |

### Week 7: Polish (P3)
| Day | Task | Owner |
|-----|------|-------|
| 45-46 | P3-1: NECTA curriculum tagging | Admin |
| 47 | P3-2: Audit logging for pricing | Backend |
| 47 | P3-3: AzamPesa transfer fee note | Frontend |

---

## SECTION D: DATABASE MIGRATIONS SUMMARY

| Migration | Tables Modified | Tables Created |
|-----------|-----------------|----------------|
| `008_past_papers.sql` | — | `past_papers` |
| `009_vitals_persistence.sql` | — | `web_vitals` |
| `010_webhooks.sql` | — | `webhook_subscriptions`, `webhook_deliveries` |
| `011_support_tickets.sql` | — | `support_tickets`, `ticket_messages` |
| `012_classrooms.sql` | — | `classrooms`, `classroom_enrollments` |
| `013_incidents.sql` | — | `incidents` |
| `014_custom_limits.sql` | `developer_profiles` | — |

---

## SECTION E: FILES TO CREATE (42 new files)

### API Routes (14)
```
src/app/api/payments/azampesa/callback/route.ts
src/app/api/payments/status/[id]/route.ts
src/app/api/cron/expire-subscriptions/route.ts
src/app/api/past-papers/route.ts
src/app/api/past-papers/[id]/route.ts
src/app/api/vitals/summary/route.ts
src/app/api/developer/webhooks/route.ts
src/app/api/developer/webhooks/[id]/route.ts
src/app/api/developer/webhooks/[id]/deliveries/route.ts
src/app/api/support/tickets/route.ts
src/app/api/support/tickets/[id]/route.ts
src/app/api/support/tickets/[id]/messages/route.ts
src/app/api/health/route.ts
src/app/api/developer/analytics/route.ts
src/app/api/developer/analytics/export/route.ts
src/app/api/teacher/classrooms/route.ts
src/app/api/teacher/classrooms/[id]/route.ts
src/app/api/teacher/classrooms/[id]/enroll/route.ts
src/app/api/teacher/classrooms/[id]/students/route.ts
src/app/api/student/classrooms/join/route.ts
```

### Pages (9)
```
src/app/student/past-papers/page.tsx
src/app/student/progress/page.tsx
src/app/teacher/analytics/page.tsx
src/app/teacher/classrooms/page.tsx
src/app/teacher/classrooms/[id]/page.tsx
src/app/support/page.tsx
src/app/support/[id]/page.tsx
src/app/status/page.tsx
src/app/developer/analytics/page.tsx
```

### Components (6)
```
src/components/shared/OfflineIndicator.tsx
src/components/shared/PerformanceChart.tsx
src/components/student/PastPaperCard.tsx
src/components/student/MockPractical.tsx
src/components/support/TicketCard.tsx
src/components/status/StatusBadge.tsx
```

### Libraries (3)
```
src/lib/offline-sync.ts
src/lib/webhook-dispatcher.ts
src/lib/sla-tracker.ts
```

### Migrations (7)
```
supabase/migrations/008_past_papers.sql
supabase/migrations/009_vitals_persistence.sql
supabase/migrations/010_webhooks.sql
supabase/migrations/011_support_tickets.sql
supabase/migrations/012_classrooms.sql
supabase/migrations/013_incidents.sql
supabase/migrations/014_custom_limits.sql
```

### Static (2)
```
public/offline.html
```

---

## SECTION F: FILES TO MODIFY (12)

```
src/app/api/payments/azampesa/route.ts          — real gateway call
src/app/payment/page.tsx                         — poll for status
src/app/api/vitals/route.ts                      — persist to DB
src/app/api/developer/credentials/route.ts       — enforce max_api_keys
src/app/developer/page.tsx                       — key limit UI
src/components/student/SimulationWrapper.tsx      — offline caching
src/app/student/[subject]/[lab]/page.tsx         — offline queue
src/lib/api-tracker.ts                           — custom rate limits
src/app/admin/billing/page.tsx                   — engineer assignment, custom limits
public/sw.js                                     — full rewrite
public/manifest.json                             — offline page
src/lib/i18n.ts                                  — new translation keys
```

---

## SECTION G: ESTIMATED EFFORT

| Priority | Items | Dev Days | Complexity |
|----------|-------|----------|------------|
| P0 | 3 | 10-12 | High (payment gateway integration) |
| P1 | 5 | 12-15 | Medium-High |
| P2 | 5 | 10-12 | Medium |
| P3 | 3 | 2-3 | Low |
| **Total** | **16** | **34-42** | |

---

## SECTION H: RISKS & DEPENDENCIES

| Risk | Mitigation |
|------|------------|
| AzamPesa API access delayed | Start with P1/P2 while waiting for merchant approval |
| Service worker offline complexity | MVP: cache static assets only, IndexedDB in Phase 2 |
| Webhook delivery reliability | Use external queue (BullMQ/SQS) in production |
| SLA monitoring cost | Start with free UptimeRobot, upgrade later |
| Past paper content sourcing | Start with 5 sample papers per subject, scale with volunteers |

---

## VERIFICATION: BEFORE LAUNCH CHECKLIST

- [ ] AzamPesa payments work end-to-end (initiate → callback → subscription activation)
- [ ] Subscription expiry cron runs hourly
- [ ] API key limits enforced (5 for basic, 10 for pro, unlimited for enterprise)
- [ ] Offline: at least 3 labs can be accessed without internet
- [ ] Past papers: at least 5 papers per subject available
- [ ] Performance dashboard shows student/teacher analytics
- [ ] Webhooks: developer can register URL and receive events
- [ ] Support tickets: pro+ users can create and receive responses
- [ ] Status page shows real system health
- [ ] All 24 pricing plan features backed by working code
