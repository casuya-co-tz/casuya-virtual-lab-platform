# CASUYA VIRTUAL LABORATORY PLATFORM

> The most advanced virtual science laboratory platform built for 500,000 concurrent Tanzanian secondary school students. Sharp-edge design. Zero compromise. Pure performance.

---

## DESIGN PHILOSOPHY

**Sharp. Precise. Uncompromising.**

Every pixel is deliberate. Every edge is sharp. Every interaction is instant. The Casuya platform rejects soft rounded corners in favor of a bold, architectural aesthetic that communicates precision, scientific rigor, and modern engineering.

### Design Principles

| Principle | Rule |
|-----------|------|
| **Sharp Edges** | `border-radius: 0` everywhere. No exceptions. Every frame, button, card, input, modal — razor sharp. |
| **High Contrast** | Dark backgrounds. Light text. Accent colors that cut through with authority. |
| **Dense Information** | Every cell earns its space. No wasted padding. Maximum data density. |
| **Instant Feedback** | Zero animation delay. Immediate state changes. No loading spinners — skeleton grids. |
| **Architectural Grid** | Strict alignment. No floating elements. Everything snaps to a 4px grid. |

### Design Tokens

```
BORDER RADIUS:     0px (all elements)
BORDER WIDTH:      1px (standard) / 2px (emphasis) / 3px (active)
BUTTON HEIGHT:     36px (compact) / 44px (standard) / 52px (large)
INPUT HEIGHT:      36px (compact) / 40px (standard)
CARD MIN-WIDTH:    280px
GRID GAP:          8px (dense) / 12px (standard) / 16px (spacious)
SHADOW:            none (default) / 0 0 0 2px var(--accent) (focus)
TRANSITION:        120ms ease-out (all interactions)
FONT:              Inter (system) / JetBrains Mono (code)
```

### Color System

```
--bg-primary:      #0A0A0B       (deepest black)
--bg-secondary:    #111113       (card surfaces)
--bg-tertiary:     #1A1A1E       (elevated surfaces)
--bg-hover:        #222228       (hover states)

--text-primary:    #F5F5F5       (main text)
--text-secondary:  #A0A0A0       (muted text)
--text-disabled:   #555555       (inactive text)

--border-default:  #2A2A2E       (subtle borders)
--border-strong:   #444448       (visible borders)
--border-focus:    #3B82F6       (focus rings)

--accent-blue:     #3B82F6       (primary actions)
--accent-green:    #10B981       (success states)
--accent-red:      #EF4444       (danger states)
--accent-amber:    #F59E0B       (warning states)
--accent-purple:   #8B5CF6       (premium/developer)
```

---

## HOME PAGE ARCHITECTURE

The landing page is the first impression. It must be instant, sharp, and conversion-focused.

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

### Dual-Action CTA

| CTA | Target | Behavior |
|-----|--------|----------|
| **Primary** | `[ LAUNCH LABS ]` | Links to central auth framework. Requires session. |
| **Secondary** | `[ INSTALL APP ]` | Triggers `service-worker.js` registration. Flags layout as installable offline PWA. No network dependency after install. |

### Platform & Documentation Pages

Markdown documents are compiled to **read-only static pages at build time** — no live database queries on render. Docs load instantly and bypass the production database entirely.

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

### Subject Cards

- **Card**: `bg-secondary`, 1px `border-default`, no shadow
- **Card Hover**: 1px `border-strong`, background shift to `bg-tertiary`
- **Icon**: 32px, left-aligned
- **Title**: 16px bold, primary text
- **Description**: 14px, secondary text, 2-line clamp
- **Badge**: Inline-block, accent fill, 12px uppercase, 2px padding

---

## FILE STRUCTURE

Minimal. Flat. Every file has a clear purpose. No deep nesting, no barrel exports, no unnecessary abstractions.

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
│   │   │   └── recovery.tsx              # Password reset
│   │   │
│   │   ├── student/
│   │   │   ├── layout.tsx                # Student shell (nav + sidebar)
│   │   │   ├── page.tsx                  # Dashboard overview
│   │   │   ├── [subject]/page.tsx        # Subject labs list
│   │   │   └── lab/[id]/page.tsx         # Live lab execution
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.tsx                # Admin shell (nav + sidebar)
│   │   │   ├── page.tsx                  # Admin dashboard
│   │   │   ├── labs/page.tsx             # All labs manager
│   │   │   ├── labs/[id]/page.tsx        # Single lab editor
│   │   │   ├── users/page.tsx            # User management
│   │   │   ├── billing/page.tsx          # Payment control
│   │   │   ├── api-keys/page.tsx         # API key vault
│   │   │   ├── docs/page.tsx             # Docs editor
│   │   │   └── settings/page.tsx         # Global config
│   │   │
│   │   └── api/                          # API route handlers
│   │       ├── auth/[...]/route.ts       # Auth endpoints
│   │       ├── labs/route.ts             # Labs CRUD
│   │       ├── labs/[id]/route.ts        # Single lab ops
│   │       ├── labs/[id]/code/route.ts   # Serve lab HTML (secure)
│   │       ├── admin/route.ts            # Admin operations
│   │       ├── embed/[id]/route.ts       # External embed
│   │       ├── v1/public/route.ts        # Free API
│   │       ├── v1/enterprise/route.ts    # Enterprise API
│   │       └── settings/route.ts         # Platform settings
│   │
│   ├── components/                       # React components
│   │   ├── ui/                           # Design system primitives
│   │   │   ├── Button.tsx                # Sharp-edge button
│   │   │   ├── Input.tsx                 # Sharp-edge input
│   │   │   ├── Card.tsx                  # Sharp-edge card
│   │   │   ├── Modal.tsx                 # Sharp-edge modal
│   │   │   ├── Badge.tsx                 # Status badges
│   │   │   ├── Table.tsx                 # Data table with cells
│   │   │   ├── Select.tsx                # Dropdown select
│   │   │   ├── Tabs.tsx                  # Tab navigation
│   │   │   ├── Toggle.tsx                # On/off switch
│   │   │   ├── Skeleton.tsx              # Loading skeleton
│   │   │   └── Toast.tsx                 # Notification toast
│   │   │
│   │   ├── layout/                       # Page-level layout
│   │   │   ├── Navbar.tsx                # Top navigation bar
│   │   │   ├── Sidebar.tsx               # Side navigation
│   │   │   ├── MobileDrawer.tsx          # Mobile menu overlay
│   │   │   └── Footer.tsx                # Footer
│   │   │
│   │   ├── home/                         # Home page sections
│   │   │   ├── Hero.tsx                  # Hero section
│   │   │   ├── SubjectCards.tsx           # Subject grid
│   │   │   ├── Features.tsx              # Feature highlights
│   │   │   └── Stats.tsx                 # Statistics row
│   │   │
│   │   ├── student/                      # Student dashboard
│   │   │   ├── CurriculumBanner.tsx       # NECTA progress tracker
│   │   │   ├── SubjectCatalog.tsx         # Subject selection grid
│   │   │   ├── SyllabusTree.tsx           # Topic/subtopic tree
│   │   │   ├── LabCard.tsx               # Individual lab card
│   │   │   └── LabRunner.tsx             # Secure lab iframe
│   │   │
│   │   ├── admin/                        # Admin dashboard
│   │   │   ├── StatsGrid.tsx             # Overview metrics
│   │   │   ├── LabEditor.tsx             # Code injection workspace
│   │   │   ├── LivePreview.tsx           # Split-screen preview
│   │   │   ├── CurriculumBuilder.tsx     # Topic/subtopic CRUD
│   │   │   ├── DataTable.tsx             # Sortable data grid
│   │   │   ├── UserTable.tsx             # User management grid
│   │   │   ├── BillingTable.tsx          # Transaction history
│   │   │   ├── APIKeyManager.tsx         # Key generation UI
│   │   │   └── DocsEditor.tsx            # Markdown editor
│   │   │
│   │   └── shared/                       # Cross-page components
│   │       ├── LanguageToggle.tsx         # EN/SW switcher
│   │       ├── RoleGuard.tsx             # Auth role gate
│   │       ├── SearchBar.tsx             # Global search
│   │       └── EmptyState.tsx            # No-data placeholder
│   │
│   ├── lib/                              # Utilities and services
│   │   ├── supabase.ts                   # Supabase client singleton
│   │   ├── auth.ts                       # Auth helpers (login, logout, session)
│   │   ├── i18n.ts                       # Translation loader
│   │   ├── lab-manager.ts                # Lab validation + deployment
│   │   ├── lab-processor.ts              # HTML sanitization + optimization
│   │   ├── rate-limiter.ts               # Redis token bucket
│   │   ├── crypto.ts                     # SHA-256 hashing, key generation
│   │   └── validators.ts                 # Input validation schemas
│   │
│   ├── hooks/                            # Custom React hooks
│   │   ├── useAuth.ts                    # Auth state + role checks
│   │   ├── useLabs.ts                    # Lab data fetching
│   │   ├── useLanguage.ts                # i18n context consumer
│   │   ├── useRateLimit.ts               # Client-side rate awareness
│   │   └── useMediaQuery.ts             # Responsive breakpoints
│   │
│   ├── types/                            # TypeScript definitions
│   │   ├── index.ts                      # All shared types
│   │   ├── database.ts                   # Supabase-generated types
│   │   └── api.ts                        # API request/response types
│   │
│   └── middleware.ts                      # Route protection + role checks
│
├── public/
│   ├── favicon.svg                       # Default favicon
│   └── js/
│       └── three.min.js                  # Three.js library cache
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql        # Full database schema
│
├── .env.example                          # Environment template
├── .gitignore                            # Git ignore rules
├── next.config.js                        # Next.js configuration
├── tailwind.config.js                    # Tailwind with sharp tokens
├── postcss.config.js                     # PostCSS
├── tsconfig.json                         # TypeScript config
└── package.json                          # Dependencies + scripts
```

### Why This Structure

| Rule | Explanation |
|------|-------------|
| **Flat `components/ui/`** | Every primitive in one folder. Find any component in 2 seconds. |
| **Page-per-folder** | Each route is a single `page.tsx`. No file proliferation. |
| **`lib/` over `utils/`** | These are services, not helpers. Each file is a complete module. |
| **Single `types/index.ts`** | One file for all shared types. No import chains. |
| **`api/` mirrors routes** | API file path matches URL path exactly. |

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
│          │  │    SECURE 3D LAB CANVAS                  │   │
│          │  │    (Three.js runs in sandbox="allow-scripts")│ │
│          │  │                                           │   │
│          │  │    Source code: NEVER sent to client      │   │
│          │  │    Right-click: DISABLED (onContextMenu)  │   │
│          │  │    Context menu: BLOCKED                  │   │
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
| **Code Protection** | Server pulls `html_threejs_code` from DB, streams into `<iframe srcDoc sandbox="allow-scripts">`. Code is **never** sent to client as JSON/text. |
| **Anti-Scraping** | `onContextMenu={(e) => e.preventDefault()}` on dashboard layout. No right-click, no source inspection. |
| **Low-Data Matrix** | Three.js core bundled as immutable, long-term-cached static asset. After first load, only tiny encrypted state packets fetched. |
| **Offline Storage** | IndexedDB cache managed by service worker. Lab state + student choices queued locally if connection drops. |
| **Grade Reconciliation** | On `window.online` restore, queued metrics pushed via `upsert` (`ON CONFLICT DO UPDATE`) to Supabase, verifying authentic timestamps. |

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
  school_id     UUID,
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
  -- Draco-compressed .glb meshes uploaded to Supabase Storage bucket "biology-assets"
  -- interactive_nodes: [{x,y,z,label}] coordinate targets declared by admin for anatomy click-labels
  interactive_nodes   JSONB,
  visibility_layers   JSONB
);

-- ==========================================
-- API & BILLING
-- ==========================================

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
  public_token      TEXT NOT NULL UNIQUE,          -- vlab_pub_live_...
  hashed_secret     TEXT NOT NULL,                 -- SHA-256 of vlab_sec_live_...
  scopes            TEXT[] DEFAULT ARRAY['labs:read'],  -- grades:read, labs:write, etc.
  is_active         BOOL DEFAULT TRUE,
  expires_at        TIMESTAMPTZ,                    -- null = no expiry
  request_count     BIGINT DEFAULT 0,              -- precise request counter
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

CREATE TABLE subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tier              TEXT CHECK (tier IN ('free','premium','enterprise')) DEFAULT 'free',
  status            TEXT CHECK (status IN ('active','expired','pending','cancelled')) DEFAULT 'active',
  provider          TEXT,
  transaction_id    TEXT,
  amount            NUMERIC(10,2),
  currency          TEXT DEFAULT 'TZS',
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
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
-- ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_credentials ENABLE ROW LEVEL SECURITY;

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
```

---

## IMPLEMENTATION PHASES

### Phase 1: Foundation
- [ ] `.gitignore` + restore working directory
- [ ] Config files: `tailwind.config.js` (sharp tokens), `postcss.config.js`, `.env.example`
- [ ] Supabase client setup + type generation
- [ ] Database schema deployment (all tables above)
- [ ] Auth system (email/password + **mobile OTP gateway**)
- [ ] UI component library (`components/ui/` — all 11 primitives)
- [ ] Middleware (role-based route protection)

### Phase 2: Home Page
- [ ] Dynamic favicon (admin upload → storage → route)
- [ ] Navbar (responsive, mobile drawer, EN/SW toggle)
- [ ] Hero section (sharp design, dual CTA, stats)
- [ ] Subject cards (Physics/Chemistry/Biology)
- [ ] i18n context + translation datasets
- [ ] Code splitting (defer Three.js until lab load)

### Phase 3: Auth Gateway
- [ ] Login/signup/recovery flows (email/password + **mobile OTP gateway**)
- [ ] Persistent token sessions (refresh rotation)
- [ ] Role assignment + RLS enforcement
- [ ] Users & seats panel (**CSV upload 10,000 students/batch**, paginated explorer)

### Phase 4: Admin Dashboard
- [ ] Overview with PostgreSQL views + edge caching
- [ ] Chemistry labs (presets grid: pH ranges, molarity, precipitate hex)
- [ ] Biology labs (**Draco .glb upload** to `biology-assets`, vector coordinate nodes)
- [ ] Physics labs (constants table: gravity, circuit load, focal ranges)
- [ ] Billing control (M-Pesa/Tigo Pesa webhook monitor, manual override)
- [ ] API keys vault (**scopes, expiration, request counters**)
- [ ] Docs editor (markdown → `documentation_content` table → static pages)
- [ ] Settings (favicon upload → **edge cache flush webhook**)

### Phase 5: Lab Editor
- [ ] Curriculum builder (topic → subtopic → lab)
- [ ] Monaco Editor workspace (syntax highlight, dark theme, line numbers, error flagging)
- [ ] Live preview (split-screen: code left, `<iframe srcDoc sandbox="allow-scripts">` right)
- [ ] Save Draft (→ `html_threejs_code`, no state change) / Publish (flips `is_published`)
- [ ] Distribution matrix (auto-generated embed links: `/api/embed/{uuid}`)

### Phase 6: Student Dashboard
- [ ] Student shell (nav + sidebar, EN/SW header)
- [ ] NECTA progress banner (O-Level/A-Level, progress bars)
- [ ] Subject catalog + syllabus tree (▶ **Fungua Maabara / Open Lab** trigger)
- [ ] Secure lab runner (server streams code into `sandbox="allow-scripts"` iframe; never sent as JSON/text)
- [ ] Anti-scraping (`onContextMenu` disabled, no right-click)

### Phase 7: API Hub
- [ ] Free tier (`/api/v1/public/labs`, edge-cached, **decoupled from primary DB**, 60 req/min/IP)
- [ ] Enterprise tier (token pair `vlab_pub_live_...` + `vlab_sec_live_...`, SHA-256 hashed storage)
- [ ] Rate limiter (Redis token-bucket, **HTTP 429** on exceed)
- [ ] Enterprise quota counter (monthly limit e.g. **1,000,000** embedded lab loads)
- [ ] Signature verification middleware (Bearer → account match → plan check)

### Phase 8: 3D Engines
- [ ] Physics engine (rigid-body, vectors)
- [ ] Chemistry engine (fragment shaders)
- [ ] Biology engine (compressed models)
- [ ] Migrate standalone labs to DB
- [ ] Score/completion webhooks

### Phase 9: Payments
- [ ] Subscription tables
- [ ] M-Pesa / Tigo Pesa integration
- [ ] Billing dashboard
- [ ] Institutional account management

### Phase 10: Scale
- [ ] PgBouncer + read replicas (Scale Matrix)
- [ ] Edge CDN (static assets + favicons)
- [ ] Offline support (**IndexedDB + service worker queue**, low-data immutable Three.js cache)
- [ ] Grade reconciliation webhook (**ON CONFLICT DO UPDATE** upsert)
- [ ] Dynamic code splitting for 3D (defer until lab click)

### Phase 11: Launch
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Security audit
- [ ] Load testing (500K)
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
REDIS_URL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

**Casuya Virtual Laboratory Platform** — Sharp edges. Zero compromise. Built for Tanzania.
