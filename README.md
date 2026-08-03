# CASUYA VIRTUAL LABORATORY PLATFORM

> Virtual science laboratory platform for Tanzanian secondary school students. NECTA-aligned simulations with Swahili support, AzamPesa payments, and offline capability.

---

## STATUS

**Alpha — verified 2026-08-03.** Complete codebase: 78 API routes, 60 pages, 26 migrations (30+ tables), full EN/SW i18n, sandboxed lab execution, AzamPesa payments + subscriptions, offline sync, and Lab Content Service integration. `npx tsc --noEmit` is clean and 17 unit tests pass (5 files).

---

## TECH STACK

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase (PostgreSQL + Auth + RLS) · custom `sid` cookie sessions · Three.js labs · DOMPurify/sanitize-html · Vitest · Sentry

---

## QUICK START

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (for Lab Content Service)
- Supabase project (for CASUYA platform)

### 1. Lab Content Service (port 3100)

```bash
cd ../lab-content-service
npm install
cp .env.example .env
# fill in database + admin credentials
npm run migrate
npm run seed
npm run dev
```

### 2. CASUYA Platform (port 3000)

```bash
npm install
cp .env.example .env.local
# fill in Supabase keys + Lab Content Service URL
npm run db:generate
npm run dev
```

Both services must be running for full functionality. CASUYA fetches lab content from the Lab Content Service via HTTP.

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint check |
| `npm run test` | Run tests (vitest) |
| `npm run db:generate` | Generate Supabase types |
| `PGPASSWORD=xxx node scripts/run_migration.js` | Run a database migration |

---

## DOCUMENTATION

The docs below are **local-only (gitignored)** so the tracked README stays short:

| Doc | Contents |
|-----|----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Service separation, file structure, component specs, database schema, security, performance, caching, sessions |
| [PLANS.md](./PLANS.md) | Implementation plan (v17) + PRING2 infrastructure plan + pricing navigation plans (V1/V2) |
| [FEATURES.md](./FEATURES.md) | Review system + thumbnail implementation records |
| [lab-content-service/README.md](./lab-content-service/README.md) | Lab Content Service (standalone, port 3100) |

---

**Casuya Virtual Laboratory Platform** — Sharp edges. Built for Tanzania.
