# CASUYA VIRTUAL LABORATORY PLATFORM

> Virtual science laboratory platform for Tanzanian secondary school students. NECTA-aligned simulations with Swahili support, M-Pesa payments, and offline capability.

---

## STATUS

**Alpha.** The project contains a complete codebase with all planned components, API routes, types, and database schema implemented. We have completed Phase 12: Full UI i18n & Auth Overhaul. See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for the full audit and completion log.

### What's implemented

- **Root config**: package.json, next.config.js, tailwind.config.js, postcss.config.js, tsconfig.json, .env.example, .gitignore
- **App routes**: 26 pages (home, auth, auth/recovery, student dashboard/subjects/lab/profile/settings, admin dashboard/labs/lab-editor/new-lab/users/billing/audit/analytics/api-keys/docs/settings, developer portal/docs, search, payment, error boundary, 404)
- **API routes**: 35+ endpoints (auth login/signup/logout, labs CRUD, lab code, profile, progress, admin stats/activity/audit, M-Pesa/Tigo payments, developer registration/credentials, public/enterprise v1 API, settings, search, subjects, subtopics, embed, vitals)
- **UI design system**: Button, Input, Card, Badge, Table, Modal, Select, Tabs, Toggle, Skeleton, Toast
- **Layout components**: Navbar (responsive with mobile drawer), Sidebar, MobileDrawer, Footer
- **Home sections**: Hero, SubjectCards, Features, Stats
- **Student components**: CurriculumBanner, SubjectCatalog, SyllabusTree, LabCard, LabRunner, LabSkeleton
- **Admin components**: StatsGrid, LabEditor, LivePreview, CurriculumBuilder, DataTable, UserTable, BillingTable, APIKeyManager, DocsEditor, EditorSkeleton
- **Shared components**: LanguageToggle, RoleGuard, SearchBar, EmptyState, ThemeProvider, WebVitals
- **Simulation**: LabSimulation — Three.js lab simulation component with per-subject 3D objects
- **Lib utilities**: supabase client, auth (custom `sid` cookie strategy via raw SQL), auth-guard, i18n (EN/SW 100% UI coverage), lab-manager, lab-processor (DOMPurify sanitization), rate-limiter, crypto, validators, db (PostgreSQL pool), api-tracker, audit-logger
- **Custom hooks**: useAuth, useLabs, useLanguage, useRateLimit, useMediaQuery
- **TypeScript types**: Full type system with models (profile, lab, school, subscription), API requests/responses, subject-specific types (physics, chemistry, biology), database row types
- **Database**: Supabase migrations with 15+ tables, indexes, RLS policies, NECTA-aligned seed data, payments table
- **Middleware**: API key validation, rate limiting, session-based route protection, CSP nonce generation
- **Security**: Content-Security-Policy with per-request nonces (middleware-generated), Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-XSS-Protection
- **Monitoring**: Sentry error tracking (client + server + edge), web vitals (LCP, INP, CLS, TTFB), audit logging
- **Error boundaries**: Client error.tsx with retry, global-error.tsx with isolated CSS + Sentry, not-found.tsx
- **Design tokens**: Light mode CSS variables + dark mode for lab execution
- **PWA**: Service worker (sw.js), manifest.json

---

## DESIGN PHILOSOPHY

**Sharp. Precise. Uncompromising.**

Every pixel is deliberate. Every edge is sharp. Every interaction is instant. The Casuya platform uses a bold, architectural aesthetic that communicates precision and scientific rigor.

### Design Principles

| Principle | Rule |
|-----------|------|
| **Sharp Edges** | `border-radius: 0` everywhere. Every frame, button, card, input, modal. |
| **High Contrast** | Light backgrounds by default for classroom readability. Dark theme for lab execution only. |
| **Dense Information** | Every cell earns its space. No wasted padding. Maximum data density. |
| **Instant Feedback** | 120ms max transition delay. Immediate state changes. Skeleton grids over spinners. |
| **Architectural Grid** | Strict alignment. No floating elements. Everything snaps to a 4px grid. |

### Design Tokens

```
BORDER RADIUS:     0px (all elements)
BORDER WIDTH:      1px (standard) / 2px (emphasis) / 3px (active)
BUTTON HEIGHT:     clamp(36px, 5vw, 44px) (compact)
                   clamp(40px, 6vw, 52px) (standard)
INPUT HEIGHT:      clamp(36px, 5vw, 40px)
CARD MIN-WIDTH:    clamp(240px, 80vw, 280px)
GRID GAP:          8px (dense) / 12px (standard) / 16px (spacious)
SHADOW:            none (default) / 0 0 0 2px var(--accent) (focus)
TRANSITION:        120ms ease-out (all interactions)
FONT SIZE:         clamp(12px, 2.5vw, 14px) (body)
                   clamp(28px, 6vw, 48px) (headline)
                   clamp(20px, 4vw, 32px) (sub-headline)
FONT:              Inter (system) / JetBrains Mono (code)
```

All sizing uses `CSS clamp()` for fluid scaling across device sizes.

### Color System — Dual Theme

**Light mode is the default** (matching NECTA exam paper aesthetics). Dark mode is reserved for lab execution environments.

```
LIGHT MODE (default — classroom-friendly):
--bg-primary:      #FFFFFF       (paper white)
--bg-secondary:    #F5F5F5       (card surfaces)
--bg-tertiary:     #EAEAEA       (elevated surfaces)
--bg-hover:        #E0E0E0       (hover states)

--text-primary:    #111113       (near-black)
--text-secondary:  #555555       (muted text)
--text-disabled:   #999999       (inactive text)

--border-default:  #EAEAEA       (subtle borders)
--border-strong:   #CCCCCC       (visible borders)
--border-focus:    #3B82F6       (focus rings)

DARK MODE (lab execution only):
--bg-primary:      #0A0A0B       (deepest black)
--bg-secondary:    #111113       (card surfaces)
--bg-tertiary:     #1A1A1E       (elevated surfaces)
--text-primary:    #F5F5F5       (main text)
--text-secondary:  #A0A0A0       (muted text)
--border-default:  #2A2A2E       (subtle borders)
--border-strong:   #444448       (visible borders)

ACCENT COLORS (shared):
--accent-blue:     #3B82F6       (primary actions)
--accent-green:    #10B981       (success states)
--accent-red:      #EF4444       (danger states)
--accent-amber:    #F59E0B       (warning states)
--accent-purple:   #8B5CF6       (premium/developer)
```

---

## HOME PAGE ARCHITECTURE

### Page Layout

```
┌──────────────────────────────────────────────────────────────┐
│  NAVBAR                                     [EN|SW]  [Login] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  VIRTUAL LABORATORY                                  │    │
│  │  ───────────────────────────────────────────────      │    │
│  │  NECTA-aligned science simulations for               │    │
│  │  Tanzanian secondary schools.                        │    │
│  │                                                      │    │
│  │  [  LAUNCH LABS  ]        [  EXPLORE API  ]          │    │
│  │                                                      │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │    │
│  │  │ 500K+    │ │ 150+     │ │ 99.9%    │             │    │
│  │  │ Students │ │ Labs     │ │ Uptime   │             │    │
│  │  └──────────┘ └──────────┘ └──────────┘             │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  SUBJECTS                                                    │
│  ─────────                                                   │
│                                                              │
│  ┌─────────────────────┐ ┌─────────────────────┐            │
│  │ ⚛  PHYSICS          │ │ 🧪 CHEMISTRY        │            │
│  │ ───────────────────  │ │ ───────────────────  │            │
│  │ Circuits, Optics,   │ │ Titration, pH,      │            │
│  │ Mechanics, Waves    │ │ Reactions, Bonds    │            │
│  │                     │ │                     │            │
│  │ [ 12 Labs Active  ] │ │ [ 8 Labs Active   ] │            │
│  └─────────────────────┘ └─────────────────────┘            │
│                                                              │
│  ┌─────────────────────┐                                     │
│  │ 🧫 BIOLOGY           │                                     │
│  │ ───────────────────  │                                     │
│  │ Anatomy, Genetics,  │                                     │
│  │ Ecology, Cells      │                                     │
│  │                     │                                     │
│  │ [ 6 Labs Active   ] │                                     │
│  └─────────────────────┘                                     │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  BUILT FOR TANZANIA                                          │
│  ─────────────────                                           │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ SWAHILI  │ │ OFFLINE  │ │ M-PESA   │ │ NECTA    │       │
│  │ NATIVE   │ │ READY    │ │ PAYMENTS │ │ ALIGNED  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  FOOTER                                     © Casuya 2026   │
└──────────────────────────────────────────────────────────────┘
```

### Navbar Specification

| Element | Style | Behavior |
|---------|-------|----------|
| Logo | Bold 18px, accent color | Links to `/` |
| Nav Links | 14px, secondary text, 1px bottom border on hover | Pre-rendered routes |
| Language Toggle | Sharp pill, 2px border, active state filled | EN/SW switch without page reload |
| Login Button | Primary accent fill, 44px height, `border-radius: 0` | Links to `/login` |
| Mobile Menu | Full-width drawer from right, 1px left border | Slide-in with overlay |

### Hero Section

- **Headline**: 48px bold, primary text, tight line-height (1.1)
- **Subheadline**: 18px regular, secondary text, max-width 640px
- **Primary CTA**: Accent fill, 52px height, full-width on mobile
- **Secondary CTA**: 2px border outline, transparent fill, same dimensions
- **Stats Row**: 3 columns, 32px bold numbers, 12px uppercase labels

---

## FILE STRUCTURE (Planned)

Target structure. All files are to be created during implementation.

```
casuya-virtual-lab-platform/
│
├── src/
│   │
│   ├── app/                              # Next.js App Router pages
│   │   ├── layout.tsx                    # Root HTML shell + providers
│   │   ├── page.tsx                      # HOME PAGE (landing)
│   │   ├── loading.tsx                   # Global skeleton loader
│   │   │
│   │   ├── auth/
│   │   │   ├── page.tsx                  # Login / Signup hub
│   │   │   └── recovery/
│   │   │       └── page.tsx              # Password reset
│   │   │
│   │   ├── student/
│   │   │   ├── layout.tsx                # Student shell (nav + sidebar)
│   │   │   ├── page.tsx                  # Dashboard overview
│   │   │   ├── [subject]/page.tsx        # Subject labs list
│   │   │   ├── [subject]/[lab]/page.tsx  # Live lab execution
│   │   │   ├── profile/
│   │   │   │   └── page.tsx              # Student profile
│   │   │   └── settings/
│   │   │       └── page.tsx              # Student settings
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.tsx                # Admin shell (nav + sidebar)
│   │   │   ├── page.tsx                  # Admin dashboard
│   │   │   ├── analytics/page.tsx        # Analytics dashboard
│   │   │   ├── audit/page.tsx            # Audit log viewer
│   │   │   ├── labs/page.tsx             # All labs manager
│   │   │   ├── labs/[id]/page.tsx        # Single lab editor
│   │   │   ├── labs/new/page.tsx         # New lab creator
│   │   │   ├── users/page.tsx            # User management
│   │   │   ├── billing/page.tsx          # Payment control
│   │   │   ├── api-keys/page.tsx         # API key vault
│   │   │   ├── docs/page.tsx             # Docs editor
│   │   │   └── settings/page.tsx         # Global config
│   │   │
│   │   ├── api/                          # API route handlers
│   │   │   ├── auth/login/route.ts       # Login
│   │   │   ├── auth/signup/route.ts      # Signup
│   │   │   ├── auth/logout/route.ts      # Logout
│   │   │   ├── labs/route.ts             # Labs CRUD
│   │   │   ├── labs/[id]/route.ts        # Single lab ops
│   │   │   ├── labs/[id]/code/route.ts   # Serve lab HTML (secure)
│   │   │   ├── admin/stats/route.ts      # Admin stats
│   │   │   ├── admin/activity/route.ts   # Admin activity
│   │   │   ├── admin/audit/route.ts      # Admin audit
│   │   │   ├── embed/[id]/route.ts       # External embed
│   │   │   ├── profile/route.ts          # User profile
│   │   │   ├── progress/route.ts         # User progress
│   │   │   ├── lab-progress/route.ts     # Lab progress
│   │   │   ├── subjects/route.ts         # Subject listing
│   │   │   ├── subtopics/route.ts        # Subtopic listing
│   │   │   ├── users/route.ts            # User management
│   │   │   ├── settings/route.ts         # Platform settings
│   │   │   ├── vitals/route.ts           # Web vitals
│   │   │   ├── developer/profile/route.ts    # Dev profile
│   │   │   ├── developer/register/route.ts   # Dev registration
│   │   │   ├── developer/credentials/route.ts # API credentials
│   │   │   ├── developer/credentials/[id]/route.ts # Single credential
│   │   │   ├── payments/mpesa/route.ts   # M-Pesa webhook
│   │   │   ├── payments/tigo/route.ts    # Tigo webhook
│   │   │   ├── v1/public/route.ts        # Free API
│   │   │   ├── v1/labs/route.ts          # v1 labs list
│   │   │   ├── v1/labs/[id]/route.ts     # v1 single lab
│   │   │   ├── v1/search/route.ts        # v1 search
│   │   │   ├── v1/enterprise/route.ts    # Enterprise API
│   │   │   └── v1/enterprise/keys/[id]/revoke/route.ts # Key revocation
│   │   │
│   │   ├── developer/
│   │   │   └── docs/page.tsx             # API documentation
│   │   │
│   │   ├── payment/
│   │   │   └── page.tsx                  # Payment page
│   │   │
│   │   └── search/
│   │       └── page.tsx                  # Search page
│   │
│   ├── components/                       # React components
│   │   ├── ui/                           # Design system primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── Toast.tsx
│   │   │
│   │   ├── layout/                       # Page-level layout
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MobileDrawer.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── home/                         # Home page sections
│   │   │   ├── Hero.tsx
│   │   │   ├── SubjectCards.tsx
│   │   │   ├── Features.tsx
│   │   │   └── Stats.tsx
│   │   │
│   │   ├── student/                      # Student dashboard
│   │   │   ├── CurriculumBanner.tsx
│   │   │   ├── SubjectCatalog.tsx
│   │   │   ├── SyllabusTree.tsx
│   │   │   ├── LabCard.tsx
│   │   │   └── LabRunner.tsx
│   │   │
│   │   ├── admin/                        # Admin dashboard
│   │   │   ├── StatsGrid.tsx
│   │   │   ├── LabEditor.tsx
│   │   │   ├── LivePreview.tsx
│   │   │   ├── CurriculumBuilder.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── UserTable.tsx
│   │   │   ├── BillingTable.tsx
│   │   │   ├── APIKeyManager.tsx
│   │   │   └── DocsEditor.tsx
│   │   │
│   │   └── shared/                       # Cross-page components
│   │       ├── LanguageToggle.tsx
│   │       ├── RoleGuard.tsx
│   │       ├── SearchBar.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── lib/                              # Utilities and services
│   │   ├── supabase.ts
│   │   ├── auth.ts
│   │   ├── i18n.ts
│   │   ├── lab-manager.ts
│   │   ├── lab-processor.ts
│   │   ├── rate-limiter.ts
│   │   ├── crypto.ts
│   │   └── validators.ts
│   │
│   ├── hooks/                            # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useLabs.ts
│   │   ├── useLanguage.ts
│   │   ├── useRateLimit.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── types/                            # TypeScript definitions
│   │   ├── index.ts
│   │   ├── models/
│   │   │   ├── profile.ts
│   │   │   ├── lab.ts
│   │   │   ├── school.ts
│   │   │   └── subscription.ts
│   │   ├── api/
│   │   │   ├── requests.ts
│   │   │   └── responses.ts
│   │   ├── labs/
│   │   │   ├── physics.ts
│   │   │   ├── chemistry.ts
│   │   │   └── biology.ts
│   │   └── database.ts
│   │
│   ├── app/
│   │   ├── error.tsx                      # Client error boundary
│   │   ├── global-error.tsx               # Root error boundary
│   │   └── not-found.tsx                  # 404 page
│   │
│   ├── components/
│   │   ├── simulation/
│   │   │   └── LabSimulation.tsx           # Three.js 3D simulation
│   │   ├── shared/
│   │   │   ├── ThemeProvider.tsx           # Light/dark theme context
│   │   │   └── WebVitals.tsx              # Web vitals collector
│   │   ├── student/
│   │   │   └── LabSkeleton.tsx            # Lab loading skeleton
│   │   └── admin/
│   │       └── EditorSkeleton.tsx         # Editor loading skeleton
│   │
│   ├── instrumentation.ts                 # Sentry server init
│   └── middleware.ts
│
├── public/
│   ├── favicon.svg
│   ├── manifest.json                      # PWA manifest
│   ├── sw.js                             # Service worker
│   └── js/
│       ├── init.js                        # Dark mode init + SW registration
│       └── three.min.js
│
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_seed_subjects.sql
│       └── 002_add_payments_table.sql
│
├── sentry.client.config.ts
├── vitest.config.ts
├── .env.example
├── .gitignore
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── package.json
```

---

## COMPONENT SPECIFICATIONS

### Button

```
┌─────────────────────────────┐
│  BUTTON TEXT                │  height: 44px
└─────────────────────────────┘  border-radius: 0
                                 border: 2px solid
                                 font: 14px bold uppercase
                                 letter-spacing: 0.5px

VARIANTS:
  primary    → bg: accent-blue,  text: white
  secondary  → bg: transparent,  border: border-strong
  danger     → bg: accent-red,   text: white
  ghost      → bg: transparent,  text: secondary
  disabled   → bg: bg-tertiary,  text: disabled, no pointer

STATES:
  default    → standard styling
  hover      → brightness 1.2
  active     → brightness 0.9, scale 0.98
  focus      → 2px focus ring offset
  loading    → skeleton shimmer, text hidden
```

### Input

```
┌─────────────────────────────┐
│  Label                      │  12px uppercase, secondary text
├─────────────────────────────┤
│  Placeholder text...        │  height: 40px
└─────────────────────────────┘  border: 1px solid border-default
                                 bg: bg-secondary
                                 font: 14px regular

STATES:
  default    → border-default
  focus      → border-focus, 2px ring
  error      → border-accent-red, error text below
  disabled   → bg: bg-tertiary, text: disabled
  filled     → text: primary
```

### Card

```
┌─────────────────────────────┐
│                             │  bg: bg-secondary
│  Card Content               │  border: 1px solid border-default
│                             │  padding: 16px
│                             │  border-radius: 0
└─────────────────────────────┘

VARIANTS:
  default    → subtle border
  hover      → border-strong, slight bg shift
  selected   → border-accent, bg elevated
  interactive → cursor pointer, hover state
```

### Table

```
┌────────────┬────────────┬────────────┬────────────┐
│  COLUMN A  │  COLUMN B  │  COLUMN C  │  ACTION    │  header: bg-tertiary
├────────────┼────────────┼────────────┼────────────┤  12px uppercase bold
│  Cell      │  Cell      │  Cell      │  [Edit]    │
├────────────┼────────────┼────────────┼────────────┤  row: bg-secondary
│  Cell      │  Cell      │  Cell      │  [Edit]    │  border-bottom: 1px
├────────────┼────────────┼────────────┼────────────┤
│  Cell      │  Cell      │  Cell      │  [Edit]    │  row hover: bg-hover
└────────────┴────────────┴────────────┴────────────┘

CELL SPECS:
  padding: 8px 12px
  font: 14px regular
  border: 1px solid border-default (per cell)
  no border-radius
  align: left (text) / center (numbers) / right (actions)
```

### Modal

```
┌──────────────────────────────────────────┐
│  MODAL TITLE                    [X]      │  overlay: bg-black/70
├──────────────────────────────────────────┤  modal: bg-bg-secondary
│                                          │  border: 2px border-strong
│  Modal content goes here.                │  width: 480px (sm)
│                                          │  width: 640px (md)
│                                          │  width: 800px (lg)
├──────────────────────────────────────────┤
│  [ Cancel ]              [ Confirm ]     │  footer: bg-bg-tertiary
└──────────────────────────────────────────┘  border-top: 1px
```

### Badge

```
┌─────────────┐
│  STATUS     │  height: 24px
└─────────────┘  padding: 0 8px
                 font: 11px bold uppercase
                 letter-spacing: 1px
                 border-radius: 0

VARIANTS:
  success    → bg: accent-green,  text: white
  warning    → bg: accent-amber,  text: black
  danger     → bg: accent-red,    text: white
  info       → bg: accent-blue,   text: white
  neutral    → bg: bg-tertiary,   text: secondary
```

---

## DASHBOARD LAYOUTS

### Student Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│  LOGO    Dashboard    Subjects    Settings        [EN|SW] [?] │
├──────────┬───────────────────────────────────────────────────┤
│          │                                                   │
│ SIDEBAR  │  [📊 45%]  [🔌 Online]  [📦 Offline Sync]          │
│ ──────── │  ─────────────────────────────────────────────── │
│          │                                                   │
│ Physics  │  PHYSICS > Current Electricity > Ohm's Law       │
│ Chemistry│  ─────────────────────────────────────────────   │
│ Biology  │  ✓ Completed    ✓ Completed    ▶ Fungua Maabara  │
│          │  ┌───────────────────────────────────────────┐   │
│ Settings │  │                                           │   │
│          │  │    SECURE LAB CANVAS                      │   │
│          │  │    (Runs in sandbox="allow-scripts")      │   │
│          │  │                                           │   │
│          │  └───────────────────────────────────────────┘   │
│          │                                                   │
│          │  [ Submit Results ]    Score: 85/100              │
│          │                                                   │
└──────────┴───────────────────────────────────────────────────┘
```

### Student Lab Execution — Security & Offline Spec

| Requirement | Implementation |
|-------------|---------------|
| **Lab Delivery** | Server retrieves lab code from DB, streams into `<iframe srcDoc sandbox="allow-scripts">`. Code is served from the server, not delivered as raw JSON to the client. |
| **Code Protection** | Minification and variable scrambling applied before database write. Intercepted DOM output is difficult to reverse-engineer. |
| **XSS Prevention** | Admin-injected lab code passes through server-side DOMPurify sanitization before database write. Script tags, event handlers, and dangerous attributes are stripped. |
| **Low-Data Mode** | Three.js core served as a cached static asset. After first load, only state packets are fetched. |
| **Offline Storage** | IndexedDB cache managed by service worker. Lab state + student choices queued locally if connection drops. |
| **Grade Reconciliation** | On `window.online` restore, queued metrics pushed via `upsert` with server-side timestamp validation and `sync_version` counter. |

### Offline Infrastructure — Fraud Prevention & Sync

| Threat | Countermeasure |
|--------|---------------|
| **Clock manipulation** | Server compares client-reported offline window against `last_server_ts`. Suspicious discrepancies (>5 min drift) are flagged and dropped. |
| **Destructive sync conflicts** | `sync_version INT` monotonic counter ensures server only accepts updates where `incoming_version > current_version`. Multi-device sync never overwrites newer data with stale records. |
| **Grade falsification** | Offline scores are encrypted in IndexedDB with a device-bound key. On sync, server validates score progression (scores can only increase, never decrease). |
| **Multi-device conflict** | Highest `sync_version` wins. If versions match, highest score is kept. Student sees conflict resolution banner on next login. |

### Admin Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│  LOGO    Dashboard    Labs    Users    Billing    API    [?]  │
├──────────┬───────────────────────────────────────────────────┤
│          │                                                   │
│ SIDEBAR  │  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ ──────── │  │ Active   │ │ Total    │ │ Revenue  │         │
│          │  │ 12,450   │ │ Labs: 26 │ │ TZS 4.2M │         │
│ Overview │  │ Students │ │          │ │ This Mo. │         │
│ Labs     │  └──────────┘ └──────────┘ └──────────┘         │
│ Users    │                                                   │
│ Billing  │  ┌───────────────────────────────────────────┐   │
│ API Keys │  │  RECENT LABS                               │   │
│ Docs     │  ├─────────┬──────────┬──────────┬──────────┤   │
│ Settings │  │ Name    │ Subject  │ Status   │ Actions  │   │
│          │  ├─────────┼──────────┼──────────┼──────────┤   │
│          │  │ Ohm's   │ Physics  │ Published│ [Edit]   │   │
│          │  │ Law     │          │          │ [View]   │   │
│          │  ├─────────┼──────────┼──────────┼──────────┤   │
│          │  │ Titra-  │ Chemistry│ Draft    │ [Edit]   │   │
│          │  │ tion    │          │          │ [View]   │   │
│          │  └─────────┴──────────┴──────────┴──────────┘   │
│          │                                                   │
└──────────┴───────────────────────────────────────────────────┘
```

---

## DATABASE SCHEMA

```sql
-- ==========================================
-- CORE TABLES
-- ==========================================

CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  role          TEXT CHECK (role IN ('admin','student','developer')) DEFAULT 'student',
  school_id     UUID REFERENCES schools(id) ON DELETE SET NULL,
  language      TEXT CHECK (language IN ('en','sw')) DEFAULT 'en',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subjects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  name_sw       TEXT NOT NULL,
  icon          TEXT,
  sort_order    INT DEFAULT 0
);

CREATE TABLE topics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id    UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  title_sw      TEXT NOT NULL,
  sort_order    INT DEFAULT 0
);

CREATE TABLE subtopics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id      UUID REFERENCES topics(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  title_sw      TEXT NOT NULL,
  sort_order    INT DEFAULT 0
);

CREATE TABLE schools (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  billing_contact_email TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES profiles(id) ON DELETE CASCADE,
  school_id         UUID REFERENCES schools(id) ON DELETE SET NULL,
  tier              TEXT CHECK (tier IN ('free','premium','enterprise')) DEFAULT 'free',
  status            TEXT CHECK (status IN ('active','expired','pending','cancelled')) DEFAULT 'active',
  storage_used_bytes BIGINT DEFAULT 0,
  storage_limit_bytes BIGINT DEFAULT 524288000,
  provider          TEXT,
  transaction_id    TEXT,
  amount            NUMERIC(10,2),
  currency          TEXT DEFAULT 'TZS',
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE labs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subtopic_id       UUID REFERENCES subtopics(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  title_sw          TEXT NOT NULL,
  description       TEXT,
  subject           TEXT CHECK (subject IN ('physics','chemistry','biology')) NOT NULL,
  html_threejs_code TEXT,
  is_published      BOOL DEFAULT FALSE,
  version           INT DEFAULT 1,
  security_score    INT DEFAULT 0,
  created_by        UUID REFERENCES profiles(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lab_progress (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lab_id            UUID REFERENCES labs(id) ON DELETE CASCADE,
  status            TEXT CHECK (status IN ('not_started','in_progress','completed')) DEFAULT 'not_started',
  score             INT DEFAULT 0,
  completion_data   JSONB,
  sync_version      INT DEFAULT 0,
  last_server_ts    TIMESTAMPTZ,
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  UNIQUE(student_id, lab_id)
);

-- ==========================================
-- SUBJECT PRESETS
-- ==========================================

CREATE TABLE chemistry_presets (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id                UUID REFERENCES labs(id) ON DELETE CASCADE,
  indicator_name        TEXT NOT NULL,
  ph_range_start        NUMERIC(4,2),
  ph_range_end          NUMERIC(4,2),
  color_hex             TEXT,
  molarity_balance      NUMERIC(8,4),
  precipitate_color     TEXT,
  config                JSONB
);

CREATE TABLE physics_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id          UUID REFERENCES labs(id) ON DELETE CASCADE,
  constant_name   TEXT NOT NULL,
  constant_value  NUMERIC(12,6),
  unit            TEXT,
  min_value       NUMERIC(12,6),
  max_value       NUMERIC(12,6),
  config          JSONB
);

CREATE TABLE biology_assets (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id              UUID REFERENCES labs(id) ON DELETE CASCADE,
  asset_name          TEXT NOT NULL,
  storage_path        TEXT NOT NULL,
  asset_type          TEXT CHECK (asset_type IN ('model','texture','label')),
  interactive_nodes   JSONB,
  visibility_layers   JSONB
);

-- ==========================================
-- API & BILLING
-- ==========================================

CREATE TABLE school_seats (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id             UUID REFERENCES schools(id) ON DELETE CASCADE,
  subscription_id       UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  allocated_profile_id  UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE TABLE developer_profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  company_or_school     TEXT NOT NULL,
  api_tier              TEXT CHECK (api_tier IN ('free','premium','enterprise')) DEFAULT 'free',
  monthly_request_limit INT DEFAULT 5000,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE api_credentials (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id      UUID REFERENCES developer_profiles(id) ON DELETE CASCADE,
  public_token      TEXT NOT NULL UNIQUE,
  hashed_secret     TEXT NOT NULL,
  scopes            TEXT[] DEFAULT ARRAY['labs:read'],
  is_active         BOOL DEFAULT TRUE,
  expires_at        TIMESTAMPTZ,
  request_count     BIGINT DEFAULT 0,
  last_used_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE api_usage (
  id                BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  credential_id     UUID REFERENCES api_credentials(id) ON DELETE CASCADE,
  endpoint          TEXT NOT NULL,
  status_code       INT NOT NULL,
  ip_address        INET,
  accessed_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PLATFORM CONFIG
-- ==========================================

CREATE TABLE platform_settings (
  key           TEXT PRIMARY KEY,
  value         JSONB NOT NULL,
  updated_by    UUID REFERENCES profiles(id),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE documentation (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  category      TEXT DEFAULT 'general',
  published     BOOL DEFAULT TRUE,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- AUDIT TRAIL
-- ==========================================

CREATE TABLE audit_log (
  id            BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  actor_id      UUID REFERENCES profiles(id),
  action        TEXT NOT NULL,
  target_type   TEXT NOT NULL,
  target_id     UUID NOT NULL,
  old_value     JSONB,
  new_value     JSONB,
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX idx_profiles_school ON profiles(school_id);
CREATE INDEX idx_labs_subtopic ON labs(subtopic_id);
CREATE INDEX idx_labs_subject_published ON labs(subject, is_published);
CREATE INDEX idx_labs_created_by ON labs(created_by);
CREATE INDEX idx_lab_progress_student ON lab_progress(student_id);
CREATE INDEX idx_lab_progress_lab ON lab_progress(lab_id);
CREATE INDEX idx_school_seats_school ON school_seats(school_id);
CREATE INDEX idx_school_seats_subscription ON school_seats(subscription_id);
CREATE INDEX idx_api_credentials_developer ON api_credentials(developer_id);
CREATE INDEX idx_api_usage_credential ON api_usage(credential_id, accessed_at);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_school ON subscriptions(school_id);
CREATE INDEX idx_documentation_slug ON documentation(slug);
CREATE INDEX idx_audit_log_actor ON audit_log(actor_id, created_at);
CREATE INDEX idx_audit_log_target ON audit_log(target_type, target_id);
CREATE INDEX idx_audit_log_action ON audit_log(action, created_at);

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Own profile" ON profiles FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Published labs visible" ON labs FOR SELECT
  USING (is_published = true OR created_by = auth.uid());
CREATE POLICY "Admins manage labs" ON labs FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Own progress" ON lab_progress FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "Own credentials" ON api_credentials FOR ALL
  USING (developer_id = auth.uid());

CREATE POLICY "Admins read audit" ON audit_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
```

---

## MONETIZATION & STORAGE QUOTAS

| Tier | Storage | Bandwidth | Labs Access | 3D Assets |
|------|---------|-----------|-------------|-----------|
| **Free** | 500MB total | 1GB/month | Basic simulations only | Compressed only |
| **Premium** | 5GB total | 50GB/month | All labs + exam prep | Full Draco .glb |
| **Enterprise** | Unlimited | Unlimited | All + custom embeds | Full + priority CDN |

### Free Tier Gates

- Basic physics/chemistry simulations (lightweight HTML/JS) are always free
- High-bandwidth biology .glb models require premium membership
- Exam-prep practical labs require M-Pesa verified subscription
- Daily data quota enforced per-user via `storage_used_bytes`
- When quota exceeded: student sees upgrade prompt, lab pauses, progress saved locally

---


## BACKUP & DISASTER RECOVERY

### Backup Strategy

| Component | Method | Frequency | Retention |
|-----------|--------|-----------|-----------|
| **Supabase Database** | Automated daily snapshots | Every 24h | 30 days |
| **Supabase Database** | WAL (Write-Ahead Log) archiving | Continuous | 7 days point-in-time |
| **Supabase Storage** | Bucket-level snapshots | Daily | 30 days |
| **Environment Config** | Git-tracked `.env.example` | Per commit | Indefinite |
| **DNS & Secrets** | Manual export + encrypted vault | Weekly | 90 days |

### Recovery Targets

| Metric | Target | Justification |
|--------|--------|---------------|
| **RPO** (Recovery Point Objective) | = 1 hour | WAL archiving enables point-in-time recovery within 1h |
| **RTO** (Recovery Time Objective) | = 4 hours | Full restore from Supabase snapshot + migration re-run |
| **Backup Verification** | Weekly | Automated restore to staging, verify row counts + RLS policies |

### Automated Backup Verification

A weekly CI job (GitHub Actions) runs the following:

1. Trigger Supabase PITR restore to staging database
2. Run `SELECT COUNT(*) FROM profiles, labs, lab_progress, api_credentials`
3. Compare row counts against pre-restore snapshot
4. Verify RLS policies are active: `SELECT schemaname, tablename, policyname FROM pg_policies`
5. Verify foreign key constraints: `SELECT conname FROM pg_constraint WHERE NOT convalidated`
6. Test auth flow: create test user, verify session, delete test user
7. Report results to Slack/Discord channel
8. If any check fails: page on-call engineer immediately

### Disaster Recovery Procedures

1. **Database Corruption** � Restore from latest Supabase PITR snapshot. Re-apply migrations from `supabase/migrations/`. Verify RLS policies active.
2. **Storage Loss** � Restore biology assets from daily snapshots. Re-upload Draco .glb files from admin backup. Lab HTML code is in DB, not storage.
3. **Full Platform Loss** � Clone repo, restore `.env.local` from encrypted vault, deploy to new infrastructure, restore DB from Supabase snapshot, re-point DNS.
4. **Data Corruption (Grades)** � Restore `lab_progress` from backup. Cross-reference with `sync_version` counters. Notify affected students.

### Data Retention

| Data Type | Retention | Deletion Method |
|-----------|-----------|-----------------|
| Student profiles | Account lifetime + 1 year | GDPR-compliant soft delete, then purge |
| Lab progress / scores | 5 years (NECTA requirement) | Archive to cold storage, then delete |
| API usage logs | 90 days | Automated partition drop |
| Payment transactions | 7 years (tax requirement) | Archive to cold storage |
| Session tokens | 24 hours | Automatic expiry |
| Offline sync queue | 7 days after sync | Automatic cleanup on successful sync |

### Backup Storage

- Primary: Supabase managed backups (same region as production)
- Secondary: Encrypted export to external S3-compatible bucket (different provider)
- Tertiary: Monthly full DB dump encrypted + uploaded to offline vault
- All backups encrypted at rest (AES-256) and in transit (TLS 1.3)

### Encryption Key Management

| Key | Storage | Rotation | Access |
|-----|---------|----------|--------|
| **Backup Encryption Key** | Supabase Vault (AES-256) | Every 90 days | CTO only |
| **Secondary Bucket Key** | AWS KMS | Every 90 days | CTO + Lead Dev |
| **Offline Vault Key** | Hardware security module (HSM) | Annual | CEO + CTO (dual control) |

- Keys are never stored in code or environment variables
- Key rotation is logged to `audit_log` table
- Emergency key revocation: CTO can rotate all keys within 15 minutes
- Old keys retained for 30 days for decryption, then purged

---

## SECURITY OBSERVABILITY

### Security Headers

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'nonce-{random}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co; frame-src 'self'; object-src 'none'` | XSS + injection prevention |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Clickjacking prevention |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer leakage control |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Feature restriction |
| `X-XSS-Protection` | `0` | Disable legacy XSS filter (CSP replaces it) |

### DDoS & WAF Protection

| Layer | Service | Configuration |
|-------|---------|---------------|
| **Edge** | Cloudflare (Free tier minimum) | DNS proxy enabled, SSL Full (Strict) |
| **DDoS** | Cloudflare DDoS Protection | L3/L4/L7 auto-mitigation, rate limiting at edge |
| **WAF** | Cloudflare WAF (Custom Rules) | Block known attack patterns, geo-blocking non-TZ traffic during lab hours |
| **Bot** | Cloudflare Bot Management | Challenge suspicious bots, allow Googlebot for SEO |
| **Origin** | Supabase API | Only accept traffic from Cloudflare IP ranges (restrict via firewall rules) |

- Cloudflare free tier handles DDoS up to 10Gbps; sufficient for initial launch
- Upgrade to Pro ($20/mo) when traffic exceeds 100K requests/day for WAF managed rules
- Enable "Under Attack" mode during active DDoS incidents
- All API traffic routed through Cloudflare before reaching Supabase origin

### CSP Nonce Implementation

The CSP header uses per-request nonces generated in middleware to allow only authorized inline scripts:

1. **Nonce Generation**: Middleware generates a cryptographically random 16-byte nonce per HTML page request using `crypto.getRandomValues()` at the edge
2. **Injection Point**: Nonce is set in the `Content-Security-Policy` HTTP header by middleware, and passed to `layout.tsx` via a custom `x-nonce` response header
3. **Script Tag Usage**: `layout.tsx` reads the `x-nonce` header and applies it to `<script>` tags using the `nonce` attribute
4. **Source**: See `src/middleware.ts` — `generateNonce()` and `addCspHeaders()` functions; `src/app/layout.tsx` — reads `x-nonce` from `headers()` and applies to `<script src="/js/init.js" nonce={nonce}>`
5. **Three.js Exception**: Lab `<iframe srcDoc>` runs with its own isolated CSP set in `/api/labs/[id]/code` (no nonce needed since code is server-rendered)
6. **Fallback**: If nonce generation fails, request is rejected with 500 (never falls back to unsafe-inline)

### Security Event Types

| Event | Severity | Trigger | Response |
|-------|----------|---------|----------|
| `auth.login_failed` | LOW | 3+ failed logins in 5 min | Log + optional CAPTCHA |
| `auth.brute_force` | HIGH | 10+ failed logins in 5 min from same IP | Temporary IP block + alert |
| `auth.session_hijack` | CRITICAL | Session used from new IP/UA combo | Revoke session + force re-auth |
| `rls.denied` | MEDIUM | RLS policy blocks request | Log + alert if pattern repeats |
| `admin.role_change` | HIGH | Any role escalation | Log + notify superadmin |
| `admin.lab_publish` | MEDIUM | Lab published to production | Log + verify sanitization |
| `admin.subscription_override` | HIGH | Manual subscription tier change | Log + require 2nd admin approval |
| `api.rate_exceeded` | LOW | Rate limit hit | Log + HTTP 429 |
| `api.key_compromised` | CRITICAL | API key used from unknown source | Revoke key + notify developer |
| `payment.webhook_invalid` | HIGH | M-Pesa webhook signature fails | Log + alert + do not process |
| `data.export_large` | MEDIUM | Bulk data export > 1000 rows | Log + require admin approval |

### Audit Trail

All privileged actions are logged to the `audit_log` table with actor, action, target, old/new values, IP, and user agent. Admins can query the audit trail. Key events:

| Action | Logged Data |
|--------|-------------|
| `lab.publish` | Lab ID, admin ID, timestamp |
| `lab.code_update` | Lab ID, old + new `html_threejs_code` hash |
| `user.role_change` | Profile ID, old role, new role |
| `subscription.override` | Subscription ID, old tier, new tier, reason |
| `api_key.create` | Developer ID, key ID, scopes |
| `api_key.revoke` | Developer ID, key ID, reason |
| `payment.webhook` | Transaction ID, status, amount |
| `settings.update` | Setting key, old value, new value |

### API Key Rotation Policy

| Tier | Default Expiry | Max Lifetime | Rotation Trigger |
|------|----------------|--------------|------------------|
| **Free** | 90 days | 90 days | Mandatory on expiry |
| **Premium** | 180 days | 1 year | Mandatory on expiry, optional manual |
| **Enterprise** | 365 days | 3 years | Mandatory on expiry, optional manual |

- Keys auto-revoke 24 hours after expiry (1-day grace period)
- Developer receives email notification at 30 days, 7 days, and 1 day before expiry
- Compromised keys: immediate revocation via dashboard or `POST /api/v1/enterprise/keys/{id}/revoke`
- All key rotations logged to `audit_log` with `api_key.rotate` action
- Revoked keys cannot be reused (token stored as `REVOKED_{hash}` in DB)
- Emergency: CTO can revoke all keys for a specific developer within 5 minutes

### Error Tracking

- **Service**: Sentry (self-hosted or cloud)
- **Scope**: All API routes, client-side errors, middleware failures
- **Sampling**: 100% for errors, 10% for performance traces in production
- **Alerts**: PagerDuty integration for CRITICAL/HIGH events
- **PII Scrubbing**: All error reports scrubbed of tokens, emails, passwords before send

### Monitoring Stack

| Layer | Tool | Metrics |
|-------|------|---------|
| **Uptime** | Supabase Health + external ping | Response time, availability |
| **Database** | Supabase Dashboard + pg_stat | Query latency, connection count, cache hit ratio |
| **API** | Redis counters + `/api/usage` table | Request rate, error rate, P50/P95/P99 latency |
| **Client** | Web Vitals via `web-vitals` library | LCP, INP, CLS, FCP, TTFB |
| **Payments** | M-Pesa webhook status | Transaction success/fail rate |
| **Alerts** | Email + SMS (Africa's Talking) | Any CRITICAL event within 60 seconds |

### Incident Response

| Severity | Response Time | Escalation | Communication |
|----------|---------------|------------|---------------|
| **CRITICAL** (data breach, auth bypass) | 15 minutes | CEO + CTO immediately | Public status page + email all users |
| **HIGH** (service outage, payment failure) | 1 hour | CTO + Lead Dev | Status page + email affected users |
| **MEDIUM** (degraded performance) | 4 hours | Lead Dev | Status page update |
| **LOW** (non-critical bug) | 24 hours | Assigned developer | Internal ticket |

### Penetration Testing Schedule

| Phase | Frequency | Scope | Provider |
|-------|-----------|-------|----------|
| **Pre-Launch** | Quarterly (3 rounds) | Full application: auth bypass, SQL injection, XSS, IDOR | External security firm |
| **Post-Launch** | Annually | Full application + infrastructure | External security firm |
| **Continuous** | Every deploy | Automated SAST/DAST via GitHub Actions | Snyk / OWASP ZAP |
| **Bug Bounty** | Ongoing (post-launch) | Authenticated student-facing features | Community (managed via HackerOne) |

- Pre-launch penetration tests must pass before production deploy
- Critical findings block release; high findings must have fix plan within 48 hours
- Test scope includes: auth flows, API endpoints, lab code injection, payment webhooks, offline sync, RLS bypass
- Pen test reports stored in encrypted vault, retained for 3 years
- Budget: ~$2,000 per external audit ( Tanzanian firms preferred for local compliance )

### Compliance Readiness

| Framework | Status | Target Date | Notes |
|-----------|--------|-------------|-------|
| **SOC 2 Type I** | Not started | 6 months post-launch | Required for enterprise/institutional customers |
| **SOC 2 Type II** | Not started | 12 months post-launch | Demonstrates sustained controls |
| **GDPR** | Partial | At launch | Student data deletion, export, consent flows |
| **Tanzania DPA** | Not started | 6 months post-launch | Data Protection Act 2022 compliance |
| **PCI DSS** | N/A | N/A | Payments handled by M-Pesa (no card data stored) |

- SOC 2 readiness required for schools/institutions with > 1,000 students
- Tanzania Data Protection Act (2022) requires data localization for student PII
- Annual compliance review recommended post-launch

---

## CORE WEB VITALS & PERFORMANCE

### Target Metrics

| Metric | Target | Threshold (Poor) | Measurement |
|--------|--------|-------------------|-------------|
| **LCP** (Largest Contentful Paint) | = 2.0s | > 2.5s | Hero image, subject cards, lab canvas |
| **INP** (Interaction to Next Paint) | = 150ms | > 200ms | Button clicks, language toggle, nav |
| **CLS** (Cumulative Layout Shift) | = 0.05 | > 0.1 | Font swap, image loading, skeleton to content |
| **FCP** (First Contentful Paint) | = 1.5s | > 1.8s | Navbar, hero text render |
| **TTFB** (Time to First Byte) | = 400ms | > 800ms | Edge CDN response |
| **TBT** (Total Blocking Time) | = 150ms | > 300ms | Main thread blocked time |

### Minimum Device Target

| Spec | Requirement | Justification |
|------|-------------|---------------|
| **OS** | Android 6.0+ (API 23) | Lowest OS with WebP support and modern WebView |
| **RAM** | 2GB minimum | School-issued tablets in Tanzania typically have 2-3GB |
| **CPU** | Quad-core 1.2GHz | Budget MediaTek/Snapdragon chipsets |
| **Storage** | 500MB free | App + cached labs + offline data |
| **Network** | 2G fallback (50KB/s) | Rural areas may only have 2G/EDGE |
| **Browser** | Chrome 60+ / WebView 60+ | Default on most Android devices |

- All performance budgets validated against 2GB Android device via Chrome DevTools throttling
- Three.js labs gracefully degrade on devices without WebGL 2.0 (show static fallback image)
- Font sizes and touch targets meet WCAG 2.1 AA minimum (44x44px touch targets)
- Offline mode tested on Android 6.0 emulator with simulated network disconnect

### Performance Budget

| Resource | Budget | Notes |
|----------|--------|-------|
| **Total JS** | = 150KB gzipped | Exclude Three.js (loaded async on lab click) |
| **Total CSS** | = 30KB gzipped | Tailwind purge must remove unused styles |
| **Total Fonts** | = 100KB | Inter (2 weights) + JetBrains Mono (1 weight) |
| **First Paint JS** | = 80KB gzipped | Only critical path for landing page |
| **Images (LCP)** | = 200KB | WebP/AVIF, served via Next.js Image |
| **Lighthouse Score** | = 95 | Performance, Accessibility, Best Practices, SEO |

### Image Optimization

| Strategy | Implementation |
|----------|---------------|
| **Format** | Next.js `<Image>` with `format="avif,webp"` fallback |
| **Sizing** | Responsive `srcSet` for 360px, 768px, 1024px, 1440px |
| **Lazy Loading** | `loading="lazy"` for below-fold images (subject cards, features) |
| **Priority** | `priority` for LCP hero image only |
| **Placeholder** | `placeholder="blur"` with tiny inline blurhash |
| **Compression** | Server-side sharp optimization at build time |
| **Biology Assets** | Draco-compressed `.glb` loaded via `<model-viewer>` with `preload="none"` |

### Font Loading

| Strategy | Implementation |
|----------|---------------|
| **Loader** | `next/font` with `display: swap` |
| **Subset** | Latin + Latin-Extended (Swahili characters) |
| **Preconnect** | `<link rel="preconnect" href="https://fonts.googleapis.com">` |
| **Fallback** | `system-ui, -apple-system, sans-serif` with `size-adjust: 105%` to minimize CLS |
| **Weights** | Inter: 400, 700. JetBrains Mono: 400. |
| **Hosting** | Self-hosted via `next/font` (no Google Fonts latency) |

### Script Loading Strategy

| Script | Strategy | Priority |
|--------|----------|----------|
| **Core app JS** | Synchronous, critical path | High |
| **Three.js** | `<script defer>` loaded on lab click, not landing page | Low |
| **Analytics** | `<script defer>` after `requestIdleCallback` | Lowest |
| **Service Worker** | Registered after `window.onload` | Low |

### Dynamic Component Loading

Lab components are loaded via `next/dynamic` with `{ ssr: false }` to avoid server-side rendering of Three.js and other heavy libraries:

```ts
// src/app/student/lab/[id]/page.tsx
import dynamic from 'next/dynamic'

const LabRunner = dynamic(() => import('@/components/student/LabRunner'), {
  ssr: false,
  loading: () => <LabSkeleton />,  // 120ms skeleton shown while loading
})

const LabEditor = dynamic(() => import('@/components/admin/LabEditor'), {
  ssr: false,
  loading: () => <EditorSkeleton />,
})
```

| Component | Dynamic Import | SSR | Reason |
|-----------|---------------|-----|--------|
| `LabRunner` | Yes | No | Three.js + iframe sandbox, client-only |
| `LabEditor` | Yes | No | Monaco Editor, 1.2MB, client-only |
| `LivePreview` | Yes | No | iframe + DOMPurify, client-only |
| `LanguageToggle` | No | Yes | Lightweight, benefits from SSR |
| `Hero` | No | Yes | Critical above-fold content |
| `SubjectCards` | No | Yes | SEO-critical, must render on server |

- Dynamic imports are code-split into separate chunks (~50KB each)
- Lab chunks are only fetched when student navigates to `/student/lab/[id]`
- Browser caches lab chunks for 7 days (Cache-Control header)
- Prefetch disabled for lab components (avoid wasted bandwidth on mobile)

### Preloading & Prefetching

| Resource | Strategy |
|----------|----------|
| **Critical CSS** | Inlined in `<head>` via Next.js |
| **LCP Image** | `<link rel="preload" as="image">` in `<head>` |
| **Next.js Routes** | `next/link` prefetches on viewport intersection |
| **Fonts** | `<link rel="preload" as="font" crossorigin>` for Inter + JetBrains Mono |
| **API Data** | Stale-while-revalidate for subject catalog (cached 60s) |

### Monitoring & Reporting

| Tool | Purpose | Frequency |
|------|---------|-----------|
| **Lighthouse CI** | Automated Lighthouse on every PR | Per PR |
| **Web Vitals Library** | Real-user metrics (RUM) sent to `/api/vitals` | Per page load |
| **Supabase Dashboard** | TTFB, query latency, connection pool | Continuous |
| **Custom Dashboard** | Aggregated P50/P95/P99 for all metrics | Hourly refresh |
| **Performance Regression Alert** | Alert if LCP > 2.5s or CLS > 0.1 for 5+ consecutive loads | Real-time |

---

## CACHING STRATEGY

### Multi-Layer Cache Architecture

| Layer | Duration | Invalidate On | Storage |
|-------|----------|---------------|---------|
| **Browser Cache (Static Assets)** | 1 year | Version bump in filename (`app.a1b2c3.js`) | Service Worker + HTTP Cache |
| **Browser Cache (HTML Pages)** | 5 minutes | Stale-while-revalidate | HTTP Cache |
| **CDN Edge Cache** | 24 hours | Admin cache purge webhook | Cloudflare Cache |
| **CDN Edge (API Responses)** | 60 seconds | Route-level `Cache-Control` headers | Cloudflare Cache |
| **Redis (API Rate Limiter)** | Sliding window | Auto-expire per token bucket | Redis TTL |
| **Redis (Session Store)** | 24 hours | Logout, password change, role change | Redis TTL |
| **Redis (Lab Data Cache)** | 5 minutes | Lab publish/update | Redis DEL on mutation |
| **Redis (Subject Catalog)** | 60 seconds | Subject CRUD by admin | Redis DEL on mutation |
| **Supabase Query Cache** | Built-in | Automatic | PostgreSQL shared_buffers |
| **Service Worker (Offline)** | 7 days | New version detected | IndexedDB |

### Cache Invalidation Rules

| Mutation | Cache Invalidated | Method |
|----------|-------------------|--------|
| Lab published/updated | Lab cache + subject catalog cache + CDN edge | `DEL lab:{id}` + `DEL subjects` + Cloudflare API purge |
| User role changed | Session store + all RLS-protected caches | `DEL session:{userId}` |
| Subscription updated | User session + lab access cache | `DEL session:{userId}` + `DEL labs:{userId}` |
| Settings changed | Platform settings cache | `DEL settings` |
| Documentation updated | Doc cache + CDN edge | `DEL doc:{slug}` + Cloudflare purge |

### Compression

| Content Type | Method | Level | Savings |
|-------------|--------|-------|---------|
| **HTML** | Brotli (primary), Gzip (fallback) | Level 6 | ~70% |
| **CSS/JS** | Brotli (primary), Gzip (fallback) | Level 6 | ~75% |
| **JSON (API)** | Brotli (primary), Gzip (fallback) | Level 4 | ~80% |
| **Images** | Already optimized (WebP/AVIF) | N/A | Pre-compressed |
| **Fonts** | Brotli + pre-compressed WOFF2 | N/A | Pre-compressed |

- Brotli requires HTTPS (enforced via HSTS header)
- Gzip fallback for clients that don't support Brotli
- Next.js config: `compress: true` in `next.config.js`
- Cloudflare edge also applies compression before serving

### Protocol & Connection

| Feature | Implementation |
|---------|---------------|
| **HTTP/2** | Enabled by default on Cloudflare + Vercel/Netlify |
| **HTTP/3 (QUIC)** | Enabled via Cloudflare (requires HSTS preload) |
| **Keep-Alive** | Connection reuse for all HTTP requests |
| **TLS 1.3** | Only TLS 1.3 supported (faster handshake than 1.2) |
| **OCSP Stapling** | Enabled via Cloudflare (faster certificate validation) |

### Incremental Static Regeneration (ISR)

| Page | ISR Strategy | Revalidation |
|------|-------------|--------------|
| **Home Page (`/`)** | ISR | Every 60 seconds |
| **Subject Pages (`/student/physics`)** | ISR | Every 300 seconds |
| **Lab Pages (`/student/lab/[id]`)** | On-demand revalidation | When lab is published/updated |
| **Documentation Pages** | ISR | Every 3600 seconds |
| **Admin Dashboard** | No ISR (dynamic) | Every request |
| **API Routes** | No ISR (dynamic) | Every request |

- ISR serves pre-rendered HTML while regenerating in background
- On-demand revalidation via `revalidatePath()` or `revalidateTag()` on admin actions
- Static pages served from Cloudflare edge (closest to user)

### Connection Pool Sizing

| Metric | Value | Justification |
|--------|-------|---------------|
| **PgBouncer Pool Size** | 50 connections | Supabase Pro plan default |
| **PgBouncer Mode** | Transaction | Allows connection reuse across requests |
| **Supabase Connection Limit** | 60 direct connections | Pro plan: 60 direct, 200 via pooler |
| **Redis Connection Pool** | 10 connections | Node.js client default |
| **Max Concurrent API Requests** | 1000/second | Rate limiter + Cloudflare protection |

---

## CONCURRENT CONNECTIONS & SESSION MANAGEMENT

### Session Architecture

| Component | Implementation |
|-----------|---------------|
| **Session Storage** | Redis (server-side, not JWT-only) |
| **Session ID** | Cryptographically random 32-byte token |
| **Session Data** | User ID, role, language, school ID, last activity |
| **Cookie** | `HttpOnly`, `Secure`, `SameSite=Strict`, 24h expiry |
| **Refresh Token** | Separate 7-day token, rotated on every use |

### Login Flow (Single User)

```
[Student enters email + password]
         |
         v
[Supabase Auth verifies credentials]
         |
         v
[Redis session created: SET session:{token} {userId,role,...} EX 86400]
         |
         v
[JWT access token issued (15 min) + refresh token (7 days)]
         |
         v
[Set-Cookie: session={token}; HttpOnly; Secure; SameSite=Strict; Path=/]
         |
         v
[RLS policies evaluated on every query using session user_id]
```

### Logout Flow (Single User)

```
[Student clicks Logout]
         |
         v
[Redis session deleted: DEL session:{token}]
         |
         v
[Refresh token invalidated in Supabase Auth]
         |
         v
[Set-Cookie: session=; Max-Age=0; Path=/]  (clear cookie)
         |
         v
[Client-side: clear localStorage, redirect to /login]
```

### Concurrent Session Limits

| Tier | Max Concurrent Sessions | Max Devices | Session Timeout |
|------|------------------------|-------------|-----------------|
| **Free** | 1 session | 1 device | 24 hours |
| **Premium** | 3 sessions | 3 devices | 24 hours |
| **Enterprise** | 10 sessions | 10 devices | 24 hours |
| **Admin** | 5 sessions | 5 devices | 8 hours (shorter for security) |

- Exceeding session limit: oldest session is invalidated with message "Session expired on another device"
- Admin sessions have shorter timeout for security
- All session changes logged to `audit_log`

### Handling Session Storms (500 Students Login Simultaneously)

When a school bell rings and 500 students login at the same time:

| Step | Action | Capacity |
|------|--------|----------|
| **1. CDN absorbs initial HTML** | Home/login pages served from Cloudflare edge | 10,000+ req/s |
| **2. Auth requests hit Supabase** | Supabase Auth handles auth with built-in rate limiting | 1,000+ auth/s |
| **3. Redis session creation** | Redis handles session writes at ~100,000 ops/s | 100,000 ops/s |
| **4. JWT token issued** | Stateless JWT verification (no DB hit) | Unlimited |
| **5. RLS queries hit DB** | PgBouncer multiplexes connections | 50 concurrent, 200 queued |
| **6. Lab data served from Redis** | Cached subject catalog + lab metadata | 10,000+ reads/s |
| **7. Static assets from CDN** | No origin server hit | 100,000+ req/s |

### Connection Pool Management

| Metric | Threshold | Action |
|--------|-----------|--------|
| **Active Connections** | < 40 of 50 | Normal operation |
| **Active Connections** | 40-50 of 50 | PgBouncer queues requests (auto) |
| **Active Connections** | > 50 for 30s | Alert: "Connection pool exhaustion risk" |
| **Redis Memory** | < 80% of allocated | Normal operation |
| **Redis Memory** | > 80% of allocated | Alert: "Redis memory pressure" |
| **Request Queue** | < 100 pending | Normal operation |
| **Request Queue** | > 100 pending | Alert: "Request backlog growing" |

### Horizontal Scaling Triggers

| Metric | Threshold | Action |
|--------|-----------|--------|
| **P95 Response Time** | > 500ms for 5 min | Scale up Supabase to Pro plan |
| **P95 Response Time** | > 1s for 5 min | Add read replica |
| **Connection Pool** | > 80% utilization | Upgrade PgBouncer pool size |
| **Redis Memory** | > 80% | Upgrade Redis plan |
| **API Error Rate** | > 1% for 5 min | Auto-scale Next.js instances |
| **Active Users** | > 10,000 | Enable edge caching for all API routes |

### Load Balancing

| Layer | Strategy | Notes |
|-------|----------|-------|
| **CDN → Origin** | Cloudflare Anycast | Automatic geographic routing |
| **Next.js Instances** | Round-robin (Vercel) or least-connections (self-hosted) | Stateless, any instance can serve any request |
| **Database Read** | PgBouncer + read replicas | Writes to primary, reads from replicas |
| **Redis** | Single instance (initially) | Upgrade to Redis Cluster at >10K concurrent users |

### Real-Time Features (WebSocket Limits)

| Feature | Max Connections | Implementation |
|---------|----------------|----------------|
| **Lab Live Preview** | 1 connection per admin | WebSocket via Supabase Realtime |
| **Notification System** | 1 connection per user | WebSocket via Supabase Realtime |
| **Offline Sync** | No WebSocket (HTTP polling) | IndexedDB → HTTP on reconnect |

- Supabase Realtime supports up to 200 concurrent connections per project
- If > 200 concurrent users need real-time: upgrade to Supabase Enterprise or use custom WebSocket server
- Lab preview uses HTTP polling (every 2 seconds) instead of WebSocket to reduce connection load

---
## IMPLEMENTATION PHASES

### Phase 1: Foundation
- [ ] Config files: `package.json`, `tailwind.config.js`, `postcss.config.js`, `next.config.js`, `tsconfig.json`
- [ ] Supabase client setup + type generation
- [ ] Database schema deployment (all tables)
- [ ] Auth system (email/password + mobile OTP)
- [ ] UI component library (`components/ui/` — all 11 primitives)
- [ ] Middleware (role-based route protection)
- [ ] Light mode default theme with fluid `clamp()` typography

### Phase 2: Home Page
- [ ] Dynamic favicon
- [ ] Navbar (responsive, mobile drawer, EN/SW toggle)
- [ ] Hero section
- [ ] Subject cards (Physics/Chemistry/Biology)
- [ ] i18n context + translation datasets

### Phase 3: Auth Gateway
- [ ] Login/signup/recovery flows
- [ ] Persistent token sessions
- [ ] Role assignment + RLS enforcement
- [ ] Users & seats panel (CSV upload, paginated explorer)

### Phase 4: Admin Dashboard
- [ ] Overview with PostgreSQL views + edge caching
- [ ] Chemistry labs (presets grid)
- [ ] Biology labs (Draco .glb upload, vector coordinate nodes)
- [ ] Physics labs (constants table)
- [ ] Billing control (M-Pesa/Tigo Pesa webhook monitor)
- [ ] API keys vault (scopes, expiration, request counters)
- [ ] Docs editor (markdown → documentation table → static pages)
- [ ] Settings (favicon upload, cache flush)

### Phase 5: Lab Editor
- [ ] Curriculum builder (topic → subtopic → lab)
- [ ] Code editor workspace (syntax highlight, line numbers, error flagging)
- [ ] Live preview (split-screen: code left, `<iframe srcDoc sandbox="allow-scripts">` right)
- [ ] Save Draft / Publish flow
- [ ] Server-side DOMPurify sanitization before every code write
- [ ] Build-time code obfuscation (minify + variable scramble) before storage
- [ ] Distribution matrix (auto-generated embed links)

### Phase 6: Student Dashboard
- [ ] Student shell (nav + sidebar, EN/SW header)
- [ ] NECTA progress banner
- [ ] Subject catalog + syllabus tree
- [ ] Secure lab runner (server streams code into sandboxed iframe)
- [ ] Offline sync with `sync_version` counter
- [ ] Server-side timestamp validation
- [ ] Storage quota display

### Phase 7: API Hub
- [ ] Free tier (edge-cached, rate-limited)
- [ ] Enterprise tier (token pair, hashed secrets)
- [ ] Rate limiter (Redis token-bucket)
- [ ] Signature verification middleware

### Phase 8: 3D Engines
- [ ] Physics engine (rigid-body, vectors)
- [ ] Chemistry engine (fragment shaders)
- [ ] Biology engine (compressed models)
- [ ] Migrate standalone labs to DB

### Phase 9: Payments
- [ ] Subscription tables + storage tracking
- [ ] M-Pesa / Tigo Pesa integration
- [ ] Billing dashboard
- [ ] Institutional account management (schools + seats allocation)

### Phase 10: Scale
- [ ] PgBouncer + read replicas
- [ ] Edge CDN (static assets)
- [ ] Offline support (IndexedDB + service worker, cached Three.js)
- [ ] Grade reconciliation webhook (upsert + sync_version validation)

### Phase 11: Launch
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Security audit
- [ ] Load testing
- [ ] Production deploy + monitoring

---

## QUICK START

```bash
git clone https://github.com/your-org/casuya-virtual-lab-platform.git
cd casuya-virtual-lab-platform
npm install
cp .env.example .env.local
# fill in Supabase keys
npm run db:generate
npm run dev
```

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint check |
| `npm run db:generate` | Generate Supabase types |

---

## ENVIRONMENT

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=
REDIS_URL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:8080
NODE_ENV=development
```

---

**Casuya Virtual Laboratory Platform** — Sharp edges. Built for Tanzania.
