# Pricing Navigation Implementation Plan

## Current State

### Navigation Structure
- **Navbar** (`src/components/layout/Navbar.tsx`): Desktop links are Dashboard, Subjects, Search, Developer (in that order, lines 49-66)
- **Sidebar** (`src/components/layout/Sidebar.tsx`): Only `student` and `admin` variants exist. No teacher or developer sidebar.
- **MobileDrawer** (`src/components/layout/MobileDrawer.tsx`): Same two variants as Sidebar.

### Current Pricing/Payment
- **Payment page** (`src/app/payment/page.tsx`): Exists at `/payment`, standalone, no auth guard. Has 3 generic plans: Basic (5,000 TSh), Pro (15,000 TSh), Institution (50,000 TSh). Uses AzamPesa (stubbed).
- **Admin billing** (`src/app/admin/billing/page.tsx`): Placeholder showing "No subscriptions yet".
- **Subscriptions table** exists in DB schema with fields: tier (free/premium/enterprise), status, amount, currency, expires_at, provider, transaction_id.

### Current Developer Pricing
- **Developer tiers** exist in code (not exposed in UI):
  - Free: 5,000 requests/month
  - Premium: 50,000 requests/month
  - Enterprise: Unlimited
- Developer registration (`src/app/api/developer/register/route.ts`) defaults to tier='free', monthly_limit=5000.
- No pricing UI for developers to upgrade their API tier.

### Roles
- DB roles: `admin`, `student`, `developer` (teacher exists in code but not in DB type)
- No React auth context; auth is cookie-based (`sid`, `role` cookies)

---

## Proposed Design

### 1. Navigation Placement

Add **Pricing** link in the Navbar between **Search** and **Developer**:

```
Dashboard | Subjects | Search | Pricing | Developer
```

**Visibility rules:**
- **Unauthenticated users**: Show Pricing (to attract signups)
- **Students**: Show Pricing (to upgrade from free tier)
- **Teachers**: Show Pricing (same as students)
- **Developers**: Show Pricing (to upgrade API tier)
- **Admins**: Show Pricing (to manage pricing settings, link to admin billing)

**Implementation in `Navbar.tsx`:**
```tsx
// After Search link (line 62), before Developer link (line 63)
<a href="/pricing" className="text-[14px] text-text-secondary hover:border-b hover:border-border-strong pb-1">
  {t('nav.pricing', lang)}
</a>
```

Add i18n key `nav.pricing` = "Pricing" (en) / "Bei" (sw).

---

### 2. Pricing Page Structure (`/pricing`)

Two distinct pricing sections on one page, separated by user type:

#### Section A: Standard Users (Students & Teachers)

**Title:** "Choose Your Learning Plan"

| Plan | Price | Features |
|------|-------|----------|
| **Free** | TSh 0 | Access to free labs only, 3 subjects, community support |
| **Basic** | TSh 5,000/month | All labs, offline sync, exam prep, all subjects |
| **Pro** | TSh 15,000/month | All Basic features + priority support, progress analytics, teacher tools (for teachers) |
| **Institution** | TSh 50,000/month | School-wide access, admin dashboard, bulk management, API access (read-only) |

**Conditions for upgrade:**
- Free -> Basic: Available immediately
- Basic -> Pro: Available immediately
- Pro -> Institution: Contact admin required

**Payment trigger:**
- When subscription is expired or user is on free tier and tries to access premium content
- Show upgrade prompt with direct link to `/pricing`

#### Section B: Developers (API Access)

**Title:** "Developer API Plans"

| Plan | Price | Monthly Requests | Features |
|------|-------|-----------------|----------|
| **Free** | TSh 0 | 5,000 | Basic API access, 1 API key, community docs |
| **Developer** | TSh 20,000/month | 50,000 | Full API access, 5 API keys, webhook support, email support |
| **Enterprise** | TSh 100,000/month | Unlimited | All features, custom rate limits, SLA, dedicated support, API key revocation tools |

**Developer plan includes:**
- API Key (public token)
- API Secret (shown once on creation, hashed in DB)
- Username (derived from user profile)
- Usage dashboard with request count, rate limit status

**Conditions for upgrade:**
- Free -> Developer: Available immediately after registration
- Developer -> Enterprise: Requires admin approval

---

### 3. Route Structure

```
/pricing                          # Public pricing page (both sections)
/pricing?section=standard         # Scroll to standard plans
/pricing?section=developer        # Scroll to developer plans
/admin/billing                    # Admin: manage pricing tiers, view subscriptions
```

---

### 4. Database Changes

#### 4.1 New Table: `pricing_plans`
```sql
CREATE TABLE pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,          -- 'free', 'basic', 'pro', 'institution', 'developer', 'enterprise'
  name TEXT NOT NULL,
  name_sw TEXT NOT NULL,              -- Swahili name
  description TEXT,
  description_sw TEXT,
  price INTEGER NOT NULL DEFAULT 0,   -- Amount in TSh
  currency TEXT NOT NULL DEFAULT 'TSh',
  interval TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly', 'one_time'
  user_type TEXT NOT NULL,            -- 'standard' (student/teacher) or 'developer'
  features JSONB NOT NULL DEFAULT '[]', -- Array of feature strings
  monthly_request_limit INTEGER,      -- NULL for standard plans, set for developer plans
  max_api_keys INTEGER,              -- NULL for standard plans, set for developer plans
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 4.2 Modify Table: `subscriptions`
Add columns:
```sql
ALTER TABLE subscriptions ADD COLUMN plan_id UUID REFERENCES pricing_plans(id);
ALTER TABLE subscriptions ADD COLUMN billing_cycle TEXT DEFAULT 'monthly'; -- monthly, yearly
```

#### 4.3 Modify Table: `developer_profiles`
Add columns:
```sql
ALTER TABLE developer_profiles ADD COLUMN plan_id UUID REFERENCES pricing_plans(id);
ALTER TABLE developer_profiles ADD COLUMN subscription_id UUID REFERENCES subscriptions(id);
```

#### 4.4 New Table: `payment_transactions`
```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  subscription_id UUID REFERENCES subscriptions(id),
  plan_id UUID NOT NULL REFERENCES pricing_plans(id),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TSh',
  provider TEXT NOT NULL,              -- 'azampesa', 'manual', etc.
  provider_transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

---

### 5. API Routes

#### 5.1 Public Pricing API
```
GET /api/pricing/plans
  - Returns all active pricing plans
  - No auth required
  - Query params: ?user_type=standard|developer
```

#### 5.2 Subscription Management
```
GET /api/subscription
  - Returns current user's active subscription
  - Auth required

POST /api/subscription/upgrade
  - Body: { plan_id: string, phone: string }
  - Creates payment transaction, initiates AzamPesa checkout
  - Auth required

POST /api/subscription/cancel
  - Cancels current subscription
  - Auth required
```

#### 5.3 Admin Pricing Management
```
GET /api/admin/pricing/plans
  - List all pricing plans (including inactive)
  - Admin auth required

PUT /api/admin/pricing/plans/:id
  - Update pricing plan (price, features, limits)
  - Admin auth required

POST /api/admin/pricing/plans
  - Create new pricing plan
  - Admin auth required

GET /api/admin/billing/subscriptions
  - List all subscriptions with filters
  - Admin auth required
```

---

### 6. Components to Create

#### 6.1 `src/components/pricing/PricingCard.tsx`
- Reusable card component for displaying a single plan
- Props: plan data, isSelected, onSelect, currentPlan (to show "Current" badge)
- Shows: name, price, feature list, CTA button

#### 6.2 `src/components/pricing/PricingSection.tsx`
- Container for a group of PricingCards
- Props: title, plans[], userType, currentPlanId
- Renders a row of PricingCards with section heading

#### 6.3 `src/components/pricing/FeatureComparison.tsx`
- Optional: expandable feature comparison table
- Shows all plans side-by-side with checkmarks for included features

#### 6.4 `src/components/pricing/UpgradePrompt.tsx`
- Modal/banner shown when user hits a paywall
- Displays relevant plan recommendation
- Direct link to `/pricing?section=...`

#### 6.5 `src/components/pricing/SubscriptionStatus.tsx`
- Shows current plan, expiry date, usage stats
- Placed in student dashboard and developer portal
- Link to manage subscription

#### 6.6 `src/components/admin/PricingManager.tsx`
- Admin UI for editing pricing plans
- Form fields: name, price, features, limits, active status
- Table view of all plans with edit/delete actions

---

### 7. Paywall Integration Points

#### 7.1 Student Lab Access
When student tries to access a premium lab:
```tsx
// In lab viewer component
if (lab.is_premium && !subscription.isActive) {
  return <UpgradePrompt recommendedPlan="basic" />
}
```

#### 7.2 Developer API Access
When developer exceeds free tier limits:
```tsx
// In api-tracker.ts or developer portal
if (usage >= plan.monthly_request_limit) {
  return NextResponse.json(
    { error: 'Rate limit exceeded', upgradeUrl: '/pricing?section=developer' },
    { status: 429 }
  )
}
```

#### 7.3 Teacher Premium Features
When teacher tries to access analytics or bulk tools:
```tsx
// In teacher dashboard
if (featureRequiresPro && !subscription.isActive) {
  return <UpgradePrompt recommendedPlan="pro" />
}
```

---

### 8. Navbar Changes (Detailed)

**File:** `src/components/layout/Navbar.tsx`

Changes needed:
1. Add `nav.pricing` link between Search and Developer (line ~62)
2. Add to mobile menu (line ~96)
3. Add i18n keys to `src/lib/i18n.ts`

**Mobile menu order:**
```
Dashboard | Subjects | Search | Pricing | Developer | Language | Login/Logout
```

---

### 9. Sidebar Changes (for logged-in users)

Add **Pricing** as a sidebar item for student and teacher roles:

```tsx
// Sidebar.tsx student items array
{ label: t('sidebar.pricing', lang), href: '/pricing', icon: '💳' }
```

For developer role (new sidebar variant needed):
```
Dashboard | My Apps | API Keys | Pricing | Docs | Settings
```

---

### 10. i18n Keys to Add

**English (`src/lib/i18n.ts`):**
```ts
'nav.pricing': 'Pricing',
'sidebar.pricing': 'Pricing',
'pricing.title': 'Choose Your Plan',
'pricing.subtitle': 'Select the plan that fits your needs',
'pricing.standardSection': 'For Students & Teachers',
'pricing.developerSection': 'For Developers',
'pricing.free': 'Free',
'pricing.basic': 'Basic',
'pricing.pro': 'Pro',
'pricing.institution': 'Institution',
'pricing.developer': 'Developer',
'pricing.enterprise': 'Enterprise',
'pricing.currentPlan': 'Current Plan',
'pricing.upgrade': 'Upgrade',
'pricing.downgrade': 'Downgrade',
'pricing.contact': 'Contact Sales',
'pricing.monthly': '/month',
'pricing.yearly': '/year',
'pricing.features.freeLabs': 'Access to free labs',
'pricing.features.allLabs': 'Access to all labs',
'pricing.features.offlineSync': 'Offline sync',
'pricing.features.examPrep': 'Exam preparation',
'pricing.features.analytics': 'Progress analytics',
'pricing.features.prioritySupport': 'Priority support',
'pricing.features.teacherTools': 'Teacher tools',
'pricing.features.schoolWide': 'School-wide access',
'pricing.features.apiAccess': 'API access (read-only)',
'pricing.features.apiKeys5': 'Up to 5 API keys',
'pricing.features.apiKeysUnlimited': 'Unlimited API keys',
'pricing.features.webhooks': 'Webhook support',
'pricing.features.sla': 'Service level agreement',
'pricing.features.dedicatedSupport': 'Dedicated support',
'pricing.features.customRateLimits': 'Custom rate limits',
'pricing.upgradePrompt.title': 'Upgrade to unlock this feature',
'pricing.upgradePrompt.description': 'This feature requires a paid plan.',
'pricing.upgradePrompt.cta': 'View Plans',
```

**Swahili keys** following the same pattern with Sw translations.

---

### 11. Auth Integration

No auth changes needed. Current flow works:
1. User visits `/pricing` (public page)
2. If logged in, fetch subscription status via `GET /api/subscription`
3. Show current plan badge on the relevant PricingCard
4. Upgrade flow: select plan -> enter phone -> POST `/api/subscription/upgrade` -> AzamPesa checkout

---

### 12. Implementation Order

1. **Database**: Create `pricing_plans` table, alter `subscriptions` and `developer_profiles`
2. **API**: Create `/api/pricing/plans` (public) and `/api/subscription` endpoints
3. **Components**: Build PricingCard, PricingSection, UpgradePrompt
4. **Page**: Create `/pricing/page.tsx` with both sections
5. **Navigation**: Add Pricing link to Navbar (between Search and Developer)
6. **Sidebar**: Add Pricing item to student sidebar
7. **Paywall**: Integrate UpgradePrompt in lab viewer, developer portal, teacher tools
8. **Admin**: Build PricingManager in admin/billing
9. **i18n**: Add all translation keys
10. **Seed**: Insert default pricing plans into `pricing_plans` table

---

### 13. File Changes Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `src/components/layout/Navbar.tsx` | Edit | Add Pricing link between Search and Developer |
| `src/components/layout/Sidebar.tsx` | Edit | Add Pricing item to student items |
| `src/lib/i18n.ts` | Edit | Add pricing translation keys |
| `src/types/database.ts` | Edit | Add pricing_plans, payment_transactions tables, modify subscriptions |
| `src/app/pricing/page.tsx` | **New** | Pricing page with standard + developer sections |
| `src/app/pricing/ClientLayout.tsx` | **New** | Client layout wrapper |
| `src/components/pricing/PricingCard.tsx` | **New** | Reusable plan card |
| `src/components/pricing/PricingSection.tsx` | **New** | Plan section container |
| `src/components/pricing/UpgradePrompt.tsx` | **New** | Paywall upgrade modal |
| `src/components/pricing/SubscriptionStatus.tsx` | **New** | Current plan display |
| `src/components/admin/PricingManager.tsx` | **New** | Admin pricing editor |
| `src/app/api/pricing/plans/route.ts` | **New** | Public pricing API |
| `src/app/api/subscription/route.ts` | **New** | Subscription status API |
| `src/app/api/subscription/upgrade/route.ts` | **New** | Upgrade endpoint |
| `src/app/api/admin/pricing/plans/route.ts` | **New** | Admin pricing CRUD |
| `src/app/admin/billing/page.tsx` | Edit | Replace placeholder with PricingManager |

---

### 14. Key Decisions to Make Before Implementation

1. **Pricing currency**: Currently TSh (Tanzanian Shilling). Confirm this is correct for all markets.
2. **Billing cycle**: Monthly only, or also yearly with discount?
3. **Trial period**: Should any plan include a free trial (e.g., 7-day Pro trial)?
4. **Refund policy**: How are failed/refunded payments handled in the UI?
5. **Institution plan**: Contact admin only, or self-service with admin approval?
6. **Enterprise developer**: Same approval flow as Institution?
7. **Feature gating**: Which specific labs are premium vs free? Need a `is_premium` flag on labs table.
8. **API rate limits**: Should free developer tier be hard-blocked or throttled after limit?

---

### 15. Visual Layout (ASCII)

```
┌─────────────────────────────────────────────────────────────────┐
│ CASUYA    Dashboard  Subjects  Search  Pricing  Developer  [≡] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Choose Your Plan                                               │
│  Select the plan that fits your needs                           │
│                                                                 │
│  ┌─ For Students & Teachers ──────────────────────────────────┐ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │ │
│  │  │ Free     │  │ Basic    │  │ Pro      │  │ Instit.  │  │ │
│  │  │ TSh 0    │  │ TSh 5k   │  │ TSh 15k  │  │ TSh 50k  │  │ │
│  │  │          │  │          │  │          │  │          │  │ │
│  │  │ • Free   │  │ • All    │  │ • All    │  │ • School │  │ │
│  │  │   labs   │  │   labs   │  │   Basic  │  │   wide   │  │ │
│  │  │ • 3 subj │  │ • Offline│  │ • Analty │  │ • Admin  │  │ │
│  │  │          │  │ • Exam   │  │ • Teacher│  │ • API    │  │ │
│  │  │ [Select] │  │ [Select] │  │ [Select] │  │ [Contact]│  │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─ For Developers (API Access) ─────────────────────────────┐ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                │ │
│  │  │ Free     │  │Developer │  │Enterprise│                │ │
│  │  │ TSh 0    │  │ TSh 20k  │  │ TSh 100k │                │ │
│  │  │          │  │          │  │          │                │ │
│  │  │ • 5k req │  │ • 50k    │  │ • Unlim. │                │ │
│  │  │ • 1 key  │  │ • 5 keys │  │ • Unlim. │                │ │
│  │  │ • Docs   │  │ • Webhook│  │ • SLA    │                │ │
│  │  │          │  │ • Email  │  │ • Ded.   │                │ │
│  │  │ [Select] │  │ [Select] │  │ [Contact]│                │ │
│  │  └──────────┘  └──────────┘  └──────────┘                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─ Your Subscription ───────────────────────────────────────┐ │
│  │  Current Plan: Free    Expires: --                        │ │
│  │  API Usage: 234 / 5,000 requests this month               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
