# Revamp-Info — Fundraising Intelligence Platform

@~/.claude/CLAUDE.md

---

## Mission

Revamp-IT's survival depends on foundation grants — this platform exists to find the right foundations, build compelling evidence of fit, and generate professional Gesuche that win funding. Success means submitted applications that convert: every line of code should move a foundation from "pipeline entry" to "funded partner."

---

## Platform Identity

### Platform Naming (SSOT: platform-brand.ts)

The platform will be released as a standalone SaaS product. Its final name is
**undecided** — "Hirnli" is a candidate (2026-07-17). Working title: "Revamp-Info".

**The rule:** the platform's name/tagline exist in exactly ONE file —
`src/lib/config/platform-brand.ts` (PLATFORM_BRAND). Renaming the product is a
one-file edit. If a rename would require touching anything else, that is an SSOT
violation to fix. Never hardcode the platform name in components, docs pages, or
content. Tenant identity (ORG_PROFILE) is separate and never supplies the
platform's name.

**Architecture:** three chromes via route groups — `(tenant)` = org site,
`(platform)` = product pages, `(share)` = chrome-less share pages. See
`docs/HIRNLI-REPLATFORM-PLAN.md` for the multi-tenant path (registry:
`src/lib/tenant/registry.ts`).

### What This Is

A **fundraising intelligence platform** that helps mission-driven organizations present themselves compellingly to potential funders, find the right foundations, and generate professional application documents.

**Currently:** Built for and used exclusively by Revamp-IT.
**Future:** Any purpose-driven organization can use this by providing their own context.

### The Core Value Chain

```
1. INGEST    → All project data (financials, impact, team, strategy)
2. PRESENT   → Beautiful, transparent, viewer-friendly dashboards
3. FIND      → Matching funders via intelligent foundation research
4. PROFILE   → Fit analysis between project and each foundation
5. GENERATE  → Professional documents (Gesuch, pitch deck, reports)
```

### Why This Matters

Foundations receive hundreds of applications. Most are plain text templates that look the same. We want to:
- **Make our data speak for itself** — transparent, inspectable, sourced
- **Show fit, not just ask for money** — each foundation profile demonstrates mutual alignment
- **Generate better documents** — not the boring plain-text Gesuch examples, but well-designed, compelling, reader-friendly documents that stand out
- **Enable the foundation to evaluate us** — the foundation profile page itself becomes a presentation tool

### Robert's Framework (Integrated)

Robert Schmuki's foundation categorization system (A/B/C/D) is integrated into our research:

| Type | Description | Our Approach |
|------|-------------|--------------|
| **A** | Perfect fit, high priority | Full proposal with tailored story |
| **B** | Good fit, worth pursuing | Targeted application |
| **C** | Possible fit, lower priority | Watch & apply when timing is right |
| **D** | Network/ecosystem value | Maintain relationship |

Robert's presentation informs our foundation search strategy and Gesuch writing, but we also aim for **better-designed** versions of the traditional Gesuch — visually compelling, data-rich, and reader-friendly rather than the plain-text documents typically shown as examples.

---

## First Principles

### 1. Data Transparency

Every number on the site must be **traceable to its source**.

- Click any metric → see source, formula, confidence level
- `NumberSources` registry = SSOT for all displayed numbers
- No black boxes. No "trust us" numbers.

### 2. Viewer-First Design

The primary audience is **someone evaluating whether to fund us** (foundation program officers, donors, partners).

- Present data in the most viewer-friendly way possible
- Progressive disclosure: overview → detail → methodology
- Every page should answer: "Why should I care?" before "Here are the details"

### 3. Foundation Profiles as Conversations

Each foundation detail page is not just research for us — it's a **presentation tool** showing:
- How our project aligns with their mission
- Concrete evidence of fit (themes, impact areas, track record)
- What we'd propose (tailored project + budget)
- That we've done our homework on them

### 4. Document Generation (Current + Future)

| Document Type | Status | Description |
|---------------|--------|-------------|
| Foundation profile page | Working | Interactive web-based fit analysis |
| Gesuch PDF (full 4-page) | Working | Professional PDF via `@react-pdf/renderer` |
| One-pager concept note | Working | Single-page summary document |
| Shareable landing page | Working | Public share URL with HMAC token |
| Pitch Deck | Working | 8-slide landscape A4 PDF via `@react-pdf/renderer` |
| Impact Report | Working | 2-page annual Wirkungsbericht from live data |

### 5. Config-Driven Data

Foundation data, themes, story components, and metrics are all in **TypeScript config files**, not hardcoded in components:

```
lib/db/foundations-repo.ts → Foundation entries (SSOT — DB read layer, cached via unstable_cache)
lib/config/stories.ts      → Narrative building blocks (SSOT)
lib/config/metrics.ts      → Metric metadata (SSOT)
lib/data/financial.ts      → Financial data + FinanceDataSet class
```

Adding a new foundation requires: **1 data entry** in `foundations.ts` (1-file rule — dynamic route handles rendering).

---

## Access Control Model

**The boundary:** Internal tools are separated from external-facing content.

```
PUBLIC (anyone)                          INTERNAL (org team, password)
───────────────────────────────────      ──────────────────────────────────────
/ (dashboard)                            /fundraising/**
/finanzen, /wirkung, /methodik, etc.     /api/pdf/**
/gesuch/share/[token]  ← by design      /api/applications/**
                                         /api/gesuch-overrides/**
                                         /api/ai/**
                                         /api/export/**
                                         /api/foundations/**
                                         /api/customizations/**
                                         /api/cron/**
                                         /api/documents/**
```

**How auth works:** `src/middleware.ts` checks HTTP Basic Auth on protected routes.
Set `INTERNAL_PASSWORD` in the server environment. If unset, all routes are open
(local dev). The browser handles the prompt — no login page, no sessions, no accounts.

**The share-page contract:** `/gesuch/share/[token]` is intentionally public. It's the
controlled channel for sending foundation-specific content to program officers. Tokens
are HMAC-SHA256 derived from `SHARE_SECRET` — unguessable without the secret.
See `src/lib/utils/share-token.ts`.

**Why this split:** A foundation officer following a share link should see a clean,
read-only presentation. They should not be able to navigate to our internal pipeline,
see our research on other foundations, or discover that content is generated from
shared templates. The `GesuchShareView` component enforces this — no toolbar, no edit
controls, no internal badges.

**Multi-tenancy implication:** When Hirnli goes multi-tenant, this middleware gets
replaced by proper per-org auth (Clerk or similar). The internal/external boundary
stays the same; auth becomes per-org rather than a single shared password.

---

## Foundation Database Model

### Two Layers, One Schema

The foundation schema has two explicit layers (`src/lib/schemas/foundation.ts`):

```
registrySchema    — Universal, org-agnostic facts
                    (name, purpose, contact, grant range, application process)
                    Survives org swaps. Can be bulk-imported from ESA/Zefix/Fundraiso.
                    Valid for ANY org using this platform.

analysisSchema    — Per-org assessment
                    (fit score, priority, type A/B/C/D, themes, researchNotes)
                    Specific to how THIS org relates to the foundation.
                    Must be rewritten when a new org onboards.
```

This split is intentional and load-bearing for multi-tenancy. Never put org-specific
judgments into the registry layer.

### Foundation Data Pipeline (Write SSOT = DB)

```
ESA / Zefix / Research scripts
        ↓ write via scripts/foundation-upsert.ts
  PostgreSQL (self-hosted) — fundraising_foundations table — WRITE SSOT
  config_data JSONB column holds all Foundation domain fields
        ↓ read via src/lib/db/foundations-repo.ts (getAllFoundations/getFoundationBySlug)
  Cached with unstable_cache (tag 'foundations', 1h TTL — writes appear within the hour)
        ↓
  All UI pages (Server Components fetch once, pass down; client components take props)
```

**Foundation funnel (verified 2026-05-05 — run `npm run audit` for live numbers):**

| Tier | Count | Table/File | What it means |
|------|-------|------------|---------------|
| Swiss universe | ~16,900 | Zefix commercial register | All registered Swiss foundations |
| In DB (active) | 15,506 | `fundraising_foundations` (archived=1,117 excluded) | Active pipeline entries |
| Rapid (LLM-triaged) | ~14,919 | (DB, excluded if data_confidence='unverified') | Zefix text + LLM triage only, always P4 |
| Read layer | 1,683 | `getAllFoundations()` | data_confidence ≠ 'unverified', non-archived, Zod valid |
| P1-P3 (actionable) | 240 | (standard/deep depth only) | Researched + scored, never rapid (P1=20, P2=78, P3=142) |
| Detail pages | varies | (tier ≥ profiliert) | Have foundation profile page |
| Gesuch pages | varies | (tier ≥ recherchiert, P1-P3) | Can generate Gesuch documents |

**Data confidence distribution (active):** unverified=13,823 · ai-assessed=1,680 · human-verified=3

**ApplicationUrl coverage:** P1=20/20 (100%) · P2=78/78 (100%) · P3=136/142 (96% raw URL; 5 use applicationMethod='email', 1 unreachable) — run `npm run audit` for gap list (1 structural gap: alice-ackermann, phone-only)

**Note:** `fundraising_foundation_registry` was dropped (2026-04-08) — it duplicated
config_data and was never read by the app. All foundation data lives in config_data JSONB.

**Adding a foundation to the pipeline:**
1. Research the foundation and prepare its data
2. Run `npx tsx scripts/foundation-upsert.ts` (or direct DB insert) with config_data
3. Pages pick it up within the cache's 1h TTL (`src/lib/db/foundations-repo.ts`)
   — no rebuild needed. Restart the app for immediate effect if needed sooner.

### Two Foundation Types (do not confuse)

| Type | File | Shape | Who uses it |
|------|------|-------|-------------|
| `Foundation` | `src/lib/schemas/foundation.ts` | Zod domain type, ~56 rich fields | UI, Gesuch generation, ~30 consumers |
| `FoundationRow` | `src/lib/db/schema.ts` | Drizzle `$inferSelect`, 13 columns | API routes, DB queries, ~15 consumers |

`Foundation` is parsed from `FoundationRow.config_data` JSONB at read time
(`foundationSchema.safeParse` in `foundations-repo.ts`). When importing, check
which layer you're in: DB API routes use `FoundationRow`; UI/domain code uses `Foundation`.

**DB columns (13 total, after SSOT cleanup 2026-04-08):**
`id`, `name`, `fit_score`, `priority`, `research_depth`, `research_date`,
`data_confidence`, `config_data`, `org_id`, `source`, `created_at`, `updated_at`, `archived`

The flat `fit_score`/`priority` columns are intentional denormalization (indexed for queries).
All other domain fields live exclusively in `config_data` JSONB.

### Scoring Model

Three independent scores, each answering one question:

| Score | Range | Question | Stored? | SSOT |
|-------|-------|----------|---------|------|
| **Fit** | 0-10 | Does this foundation match our mission? | Yes (`fitScore`) | `lib/config/fit-scoring.ts` (SCORING_ENGINE) |
| **Readiness** | 0-100 → 5 Tiers | Can we write a great Gesuch? | Computed | `lib/config/fit-scoring.ts` (READINESS_ENGINE) |
| **Priority** | 0-100 → P1-P4 | Should we invest effort now? | Stored (1-4) | `lib/config/fit-scoring.ts` (PRIORITY_FORMULA) |

**How they connect:**
```
Foundation data ──→ Fit Engine ──→ fitScore (0-10)  [stored]
Foundation data ──→ Readiness Engine ──→ score (0-100) → Tier  [computed]
fitScore × Readiness ──→ Priority Engine ──→ P1-P4  [stored or computed]
Tier + Priority ──→ Access Gates (detail page ≥ profiliert, gesuch ≥ recherchiert + P1-P3)
```

**Key helpers** (all in `lib/domain/foundation-helpers.ts`):
- `getFitLevel(f)` — fitScore → display stars (0-3), gated by tier < profiliert → 0
- `isResearched(f)` — tier ≥ profiliert (canonical signal; the legacy stored `needsResearch` boolean was removed in commit 7161034)
- `getQualityTier(f)` — readiness score → tier label
- `hasGesuchPage(f)` — tier ≥ recherchiert AND P1-P3

**Priority gate:**
- `researchDepth = 'rapid'` → always P4. Rapid foundations have only LLM-triaged register
  text. They cannot be P1-P3 regardless of fitScore.
- Pipeline scripts enforce this at write time; DB backfill confirmed 2026-04-22 (30 misclassified foundations corrected).
- No GREATEST/LEAST ratcheting — new writes are authoritative for fitScore and priority.

**Trust levels** (computed at render time, not stored):
- `getTrustLevel(f)` in `lib/config/trust-levels.ts` derives from `source` + `researchDepth`
- `verified` = manual/cantonal source or deep depth
- `assessed` = website/ESA/Fundraiso/StiftungSchweiz source or standard depth
- `unverified` = automated-research at rapid depth
- Shown as colored dot on cards, badge in sidebar, warning banner on unverified P1-P3 pages

**Research links** (`lib/config/research-links.ts`):
- 7 external platforms per foundation (Zefix, UID-Register, StiftungSchweiz, Fundraiso,
  Moneyhouse, North Data, Google)
- Config-driven, URL-constructed from UID/name — no scraping, no guessing
- Displayed in foundation sidebar under "Recherche-Links"

**All config in one file:** `src/lib/config/fit-scoring.ts` holds every weight, threshold,
penalty, and tier boundary. The domain engines (`fit-scoring.ts`, `foundation-scores.ts`)
are pure computation — zero magic numbers.

### Research Priority

The foundation DB grows independently of which orgs use it, but in **priority order**:

1. Foundations whose mission overlaps with Revamp-IT's core areas
   (Kreislaufwirtschaft, Arbeitsintegration, Digitale Bildung, Zürich/regional)
2. Broader Swiss foundations with general social/environmental scope
3. European/international foundations with Swiss presence
4. Everything else (Alzheimer research foundations, medical, etc. — eventually, not now)

**Why this order matters:** Researching 15,000+ foundations is years of work. Research
effort should produce fundable applications, not an exhaustive index. Add context where
it unlocks a real application.

**Research quality is derived from readiness tier** (computed, not stored):
- `isResearched(f)` checks `tier >= profiliert` (from `foundation-helpers.ts`)
- Tier is computed from data completeness signals in `computeReadinessScore()`
- Key signals: purposeSummary, researchNotes, contact, themes, websiteUrl

Quality gate is enforced at import time by `src/lib/domain/foundation-quality.ts`
(called from `src/lib/config/foundations/index.ts`). Violations warn but don't break builds.

---

## Organization Profile

### `src/lib/config/org-profile.ts` — Identity SSOT
All programmatic references to the organization (name, website, email,
mission summary) import from `ORG_PROFILE`. Never hardcode org name in
domain logic or UI chrome.

### ORG-SPECIFIC Files
Files marked `ORG-SPECIFIC` contain content specific to the current org.
To support a new org, these files need content rewriting (not just
search-replace). See file headers for details.

### Swapping Orgs Checklist
1. Edit `org-profile.ts` with new org identity
2. Rewrite `stories.ts` narratives
3. Rewrite THEMES in `metadata.ts` + ThemeId enum in `foundation.ts`
4. Reseed foundation DB (new research, fit scores, priorities) — pages read live, no sync step
5. Rewrite NOT_RECOMMENDED, schwerpunkte, budget-scenarios
6. Rewrite page content (/revamp-2030, /strategie, /team)
7. Update branding (logo, colors if needed)
8. `npm run build` must pass

---

## Current Architecture

### Tech Stack

```
Next.js 16 + TypeScript + Tailwind CSS v4
├── Next.js App Router    → Layouts, dynamic routes, static generation
├── TypeScript (strict)   → Type safety throughout
├── Tailwind CSS v4       → Utility-first styling with design tokens
├── Zod 4                 → Schema validation, SSOT for types
├── Chart.js + react-chartjs-2 → Financial visualizations
└── Hetzner               → Hosting (self-hosted behind Caddy, Next.js standalone)
```

### File Structure

```
revamp-info/
├── CLAUDE.md                          # THIS FILE — product vision + engineering guide
├── next.config.ts                     # Standalone output, security headers, redirects
├── src/
│   ├── app/                           # Next.js App Router (28 page routes)
│   │   ├── layout.tsx                 # Root layout (Nav + Footer)
│   │   ├── page.tsx                   # Dashboard
│   │   ├── globals.css                # Design tokens + Tailwind v4
│   │   ├── finanzen/                  # Financial deep dive (8-year P&L)
│   │   ├── wirkung/                   # Impact metrics
│   │   ├── methodik/                  # Methodology + transparency report
│   │   ├── preismodell/               # Solidarity pricing model
│   │   ├── strategie/                 # Vision, mission, SDGs
│   │   ├── team/                      # Team & capacity
│   │   ├── operations/                # SOPs & processes
│   │   ├── dokumente/                 # Document library
│   │   ├── wie-wir-arbeiten/          # How we work (impact methodology)
│   │   ├── revamp-2030/              # Vision 2030 strategy
│   │   ├── gesuch/share/[token]/     # Public share pages (HMAC-protected)
│   │   └── fundraising/
│   │       ├── page.tsx               # Fundraising hub
│   │       ├── stiftungen/            # Foundation list + [slug] detail + [slug]/gesuch
│   │       ├── applications/          # Pipeline management + [id] detail
│   │       ├── hub/                   # Hub/space planning
│   │       ├── bildung/               # Education program funding
│   │       ├── scoring-methodik/      # Scoring methodology
│   │       └── gesuch-vorlagen/       # Template list + [type] detail
│   ├── components/
│   │   ├── layout/                    # Nav, Footer, PageHeader, StoryBridge, WhyThisMatters
│   │   ├── ui/                        # Badge, Button, Card, CTABanner, Tabs, Modal, Table, etc.
│   │   ├── charts/                    # RevenueChart, CategoryBreakdown, AnnualTrendChart, ChartWrapper
│   │   ├── foundation/               # FoundationCard, Header, Sidebar, FitAnalysis
│   │   ├── gesuch/                    # GesuchEditPanel, GesuchSubmitSection, section components
│   │   ├── fundraising/              # Pipeline, application tracking components
│   │   ├── budget/                    # Budget visualization components
│   │   ├── hub/                       # Hub image generator
│   │   ├── data/                      # Data display components
│   │   ├── documents/                 # Document management components
│   │   └── metrics/                   # MetricCard, MetricGrid, NumberInspector
│   ├── lib/
│   │   ├── schemas/                   # Zod schemas (foundation, financial, metric, story, etc.)
│   │   ├── config/                    # foundations/, stories, metrics, nav, gesuch-templates, etc.
│   │   ├── data/                      # FinanceDataSet class + fallback data (2022-2025)
│   │   ├── db/                        # Drizzle schema, migrations, queries
│   │   ├── domain/                    # gesuch-composer, bridge-composer, foundation-filter, etc.
│   │   ├── pdf/                       # PDF templates (GesuchTemplate, etc.)
│   │   ├── types/                     # Shared TypeScript types
│   │   └── utils/                     # formatCHF, formatPercent, share-token, etc.
│   └── hooks/                         # useFinancialData, useFoundationFilters, useGesuchOverrides, useNumberInspector
```

### Data Flow

```
Kivitendo (Accounting)  →  CSV Export       →  lib/data/financial.ts (embedded)        →  Dashboard
Research scripts        →  DB (Postgres/Drizzle) →  lib/db/foundations-repo.ts (cached) →  [slug] route
Impact Methodology      →  lib/config/metrics.ts                                        →  Inspectable metrics
Narrative Content       →  lib/config/stories.ts                                        →  Foundation stories
```

### SSOT Components

| Component | File | Purpose |
|-----------|------|---------|
| Navigation | `components/layout/Nav.tsx` | App-wide nav via layout.tsx |
| Footer | `components/layout/Footer.tsx` | Footer via layout.tsx |
| Formatting | `lib/utils/format.ts` | CHF, %, number, date formatting |
| Foundation Data | `lib/db/foundations-repo.ts` | getAllFoundations()/getFoundationBySlug() — cached DB read layer |
| Story Blocks | `lib/config/stories.ts` | WHY/HOW/WHAT/EVIDENCE narratives |
| Number Metadata | `lib/config/metrics.ts` | Source, formula, confidence per metric |
| Org Identity | `lib/config/org-profile.ts` | ORG_PROFILE — all programmatic org references |
| Gesuch Composer | `lib/domain/gesuch-composer.ts` | Composes Gesuch document from config |
| Bridge Composer | `lib/domain/bridge-composer.ts` | Foundation↔org connection narratives |
| Trust Levels | `lib/config/trust-levels.ts` | Derives verified/assessed/unverified from source + depth |
| Research Links | `lib/config/research-links.ts` | 7 external platform URLs per foundation |
| Schemas | `lib/schemas/*.ts` | Zod schemas → TypeScript types |

---

## Data Integrity Rules

**NEVER auto-write unverified data to the DB.** Scripts that scrape websites or guess URLs
without verification are forbidden. See the 2026-04-07 incident where `discover-websites.ts`
guessed URLs from slugs — 54% were wrong (car garages, restaurants, bands).

**Rules for enrichment scripts:**
1. Never write scraped data to DB without human review or verified provenance
2. Every contact data point needs a source (where it came from)
3. Website discovery must verify the site belongs to the foundation
4. Scripts should have `--dry-run` and output candidates for review
5. The 4 remaining direct-DB-write scripts have caution headers

**Deleted dangerous scripts (2026-04-08):**
- `discover-websites.ts` — guessed URLs from slugs, 54% wrong
- `scrape-emails.ts` — scraped emails from unverified websites
- `registry-import.ts` — wrote to dropped registry table

---

## Known Issues & Technical Debt

### Remaining

- 1 P3 truly unreachable (alice-ackermann: phone-only, no appUrl, no email) — also the only
  remaining APPLICATION URL gap. Run `npm run audit` for the live list.
- 13 Gesuch documents have data-quality issues per `gesuch-audit` (run `npx tsx scripts/gesuch-audit.ts`):
  5 P2 and 8 P3 — mostly missing email/phone or no real websiteUrl — needs per-foundation
  research enrichment, not a code fix. Verified external research required (auto-scraping
  is forbidden per 2026-04-07 data-integrity rule).
  Per-tier perfect: P1 20/20 (100%), P2 70/75 (93%), P3 109/117 (93%) — 199/212 total.
  Use `/fundraising/stiftungen?gaps=1` or the "Lücken füllen" preset to find them.

---

## Design System

**Tailwind v4 — no `tailwind.config.ts`.** All tokens are defined in `src/app/globals.css` using the `@theme inline` directive. Tailwind reads CSS vars directly; no separate config file exists or is needed.

**Token file:** `src/app/globals.css` — the only SSOT for all design tokens.

### Colors — `@theme inline` in `src/app/globals.css`

**Revamp-IT brand palette:**
```css
--color-revamp-green:  #2ECC71;
--color-revamp-blue:   #3498DB;
--color-revamp-orange: #E67E22;
```

**Greys:**
```css
--color-grey-dark:   #2C3E50;
--color-grey-medium: #7F8C8D;
--color-grey-light:  #ECF0F1;
```

**Semantic colors:**
```css
--color-primary:       #3498DB;
--color-primary-light: #5DADE2;
--color-secondary:     #2ECC71;
--color-accent:        #E67E22;

--color-success:      #2ECC71;
--color-success-bg:   #D5F5E3;
--color-success-text: #166534;   /* 6.1:1 on success-bg */
--color-warning:      #E67E22;
--color-warning-bg:   #FDEBD0;
--color-warning-text: #7C3200;   /* 7.8:1 on warning-bg */
--color-danger:       #E74C3C;
--color-danger-bg:    #FADBD8;
--color-danger-text:  #7F1D1D;   /* 7.7:1 on danger-bg */
--color-primary-text: #1A5C8A;   /* 6.5:1 on primary/10 bg */

--color-text:       #2C3E50;
--color-text-light: #546270;     /* 4.9:1 on bg-light */
--color-text-muted: #5A6672;     /* 5.1:1 on bg-light */
--color-bg:         #FFFFFF;
--color-bg-light:   #ECF0F1;
--color-border:     #D5D8DC;
```

**Chart series:**
```css
--color-chart-1: #3498DB;
--color-chart-2: #2ECC71;
--color-chart-3: #E67E22;
--color-chart-4: #E74C3C;
--color-chart-5: #9B59B6;
--color-chart-6: #1ABC9C;
```

**Theme colors (foundation themes):**
```css
--color-theme-klima:     #10b981;
--color-theme-kreislauf: #059669;
--color-theme-sozial:    #8b5cf6;
--color-theme-bildung:   #3b82f6;
--color-theme-digital:   #6366f1;
--color-theme-zuerich:   #ef4444;
--color-theme-arbeit:    #14b8a6;
```

**Pillar colors (vision/strategy pages):**
```css
--color-pillar-vision:  #8b5cf6;   /* violet */
--color-pillar-digital: #6366f1;   /* indigo */
--color-pillar-social:  #14b8a6;   /* teal */
--color-pillar-eco:     #10b981;   /* green */
```

**Extended palette (data visualization, status chips — not UI states):**
```css
--color-amber:       #f59e0b;  --color-amber-bg:  #fef3c7;  --color-amber-text:  #b45309;
--color-yellow:      #eab308;  --color-yellow-bg: #fef9c3;  --color-yellow-text: #854d0e;
--color-purple:      #7c3aed;  --color-purple-bg: #ede9fe;  --color-purple-text: #4c1d95;
--color-pink:        #db2777;  --color-pink-bg:   #fce7f3;  --color-pink-text:   #831843;
--color-cyan:        #06b6d4;
```

### Shape & Elevation

```css
/* Border radius — override Tailwind v4 defaults */
--radius-sm:   4px;
--radius-md:   6px;
--radius-lg:   8px;
--radius-xl:   12px;
--radius-2xl:  16px;
--radius-3xl:  24px;
--radius-full: 9999px;

/* Shadows — override Tailwind v4 defaults */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
```

### Typography

```css
--font-sans: var(--font-inter), 'Segoe UI', system-ui, -apple-system, sans-serif;
--font-mono: 'Consolas', 'Monaco', monospace;
```

### Gradient Utility Classes

All gradients are defined as CSS classes in `globals.css` — never inline in components:

```css
/* Hero backgrounds */
.gradient-hero-vision       .gradient-hero-transparency
.gradient-hero-fundraising  .gradient-hero-financial

/* Brand accent bar */
.gradient-brand

/* Nav item states */
.gradient-nav-highlight  .gradient-nav-active

/* Card tints */
.gradient-card-success  .gradient-card-primary
.gradient-card-digital  .gradient-card-art

/* Section heroes */
.gradient-hero-bildung  .gradient-hero-community

/* SDG badge colors */
.gradient-sdg-4  .gradient-sdg-8  .gradient-sdg-9
.gradient-sdg-10 .gradient-sdg-12 .gradient-sdg-13
```

### Typography Utility Classes

Semantic heading scale defined in `globals.css` via `@layer utilities`:

```css
.heading-page        /* text-xl font-bold text-grey-dark md:text-3xl */
.heading-section     /* text-2xl font-bold text-grey-dark */
.heading-subsection  /* text-xl font-semibold text-grey-dark */
.heading-card        /* text-lg font-semibold text-grey-dark */
.heading-item        /* text-base font-semibold text-grey-dark */
.heading-detail      /* text-sm font-semibold text-grey-dark */
.heading-label       /* text-sm font-semibold uppercase tracking-wider text-text-muted */
.heading-xs-label    /* text-xs font-semibold uppercase tracking-wider text-text-muted */
```

### Interaction & Z-Index Utilities

```css
.transition-standard  /* transition-colors duration-200 */
.transition-hover     /* transition-all duration-200 */
.transition-reveal    /* transition-all duration-300 ease-out */

.z-backdrop  /* z-40 */
.z-modal     /* z-50 */
```

### Note on `lib/utils/theme.ts`

`themeStyle(color)` in `src/lib/utils/theme.ts` returns an inline style object (`{ backgroundColor: color + '33', color }`). This is used for dynamic theme badge colors sourced from `THEMES` config — the color value comes from the token at runtime, so this is an acceptable non-violation (dynamic, not hardcoded).

### SSOT Rule

All design tokens live in `src/app/globals.css` only. Tailwind config MUST reference CSS vars (`'var(--name)'`), never literal values. Components MUST use semantic Tailwind classes, never arbitrary values like `bg-[#hex]`.

**Violations to fix when touching UI:**
- `bg-[#hex]` / `text-[#hex]` in className → CSS var + semantic class
- `style={{ color: '#hex' }}` → CSS var + className
- Literal hex in tailwind.config → `'var(--color-name)'`
- Same token defined in 2+ files → consolidate to globals.css

**Audit:** `grep -r '\[#' src/` — every result is a violation.

---

## Development Guide

### Local Development

```bash
npm run dev
# Visit http://localhost:3000
```

### Build

```bash
npm run build
```

### Pipeline Audit

The authoritative pipeline health check. Run after any rescore, sync, or research batch:

```bash
npm run audit
# Prints: funnel counts, priority breakdown, applicationUrl coverage, gap list
# Use this output to update the funnel table in CLAUDE.md
```

### Adding a Foundation

**DB is write SSOT.** Reads are live — no generated file, no sync step.

1. Research the foundation; prepare config_data with all required fields
2. Run `npx tsx scripts/foundation-upsert.ts --slug=<slug>` (or use the API: `POST /api/foundations`)
3. The page appears within the read layer's 1h cache TTL (`src/lib/db/foundations-repo.ts`)
   — no rebuild needed. `generateStaticParams()` pre-renders it on the next deploy; until
   then `dynamicParams = true` serves it on-demand.

**Research quality** is derived from readiness tier (computed at runtime from data completeness).
`isResearched(f)` returns true when tier >= profiliert. Key data signals:
purposeSummary (150+ chars), researchNotes (250+ chars), contact, themes, websiteUrl.
Quality gate in `foundation-quality.ts` runs on each cache refresh and warns about violations.

**Gesuch pages are only generated** for entries with tier >= recherchiert AND priority P1-P3
(see `generateGesuchParams()` in `foundation-helpers.ts`).

**NEVER hardcode foundation/template counts** in UI text or documentation. Always derive from
`getAllFoundations()`'s result length or equivalent. Counts go stale the moment a new foundation is added.

### Schema Changes (Migrations)

Schema lives in `src/lib/db/schema.ts`. After editing:

```bash
# 1. Export DATABASE_URL first (drizzle-kit doesn't auto-load .env.local)
export DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d= -f2-)

# 2. Generate SQL migration file
npx drizzle-kit generate   # creates src/lib/db/migrations/<timestamp>_<name>.sql

# 3. Apply to DB
npx drizzle-kit push       # pushes schema diff to the Postgres DB
```

**Rules:**
- Migration files in `src/lib/db/migrations/` are source of truth for DB history — commit them
- `drizzle-kit push --dry-run` is NOT supported (v0.31.9) — review the push output for DROP statements before confirming
- Only ALTER statements should appear for existing tables; DROPs require explicit confirmation
- `setup-db.ts` has been deleted — migrations replace it entirely

### Adding a Section Page

1. Create `src/app/[section]/page.tsx`
2. Add to `NAV_STRUCTURE` in `src/lib/config/nav.ts`
3. Use `PageHeader` and `Card` components for consistent styling

### Content Rules

- **Swiss German:** Use "ss" not "ß". **ALWAYS use real umlauts** (ä ö ü) in all user-facing text — NEVER substitute with ae/oe/ue.
- **Source everything:** Every data point needs a source citation
- **Types from schemas:** Always derive types via `z.infer<>`, never define separately
- **Config over code:** Data in `lib/config/`, business logic in `lib/domain/`, rendering in `components/`

---

## Quality Checklist

Before pushing:

- [ ] `npm run build` passes (TypeScript + static generation)
- [ ] All internal links work (no 404s)
- [ ] Mobile-responsive (test at 375px)
- [ ] Swiss German spelling (ss not ß, real umlauts ä ö ü — never ae oe ue)
- [ ] Sources cited for all data/claims
- [ ] New data added to config files, not hardcoded in components
- [ ] Types derived from Zod schemas, not defined separately

---

## New Org Onboarding

### The Approach

Claude Code IS the onboarding engine. No runtime multi-tenancy. One repo instance
per organization. Clone repo → drop context documents → Claude rewrites 17 files → deploy.

See `org-context/README.md` for full documentation and `org-context/_template/README.md`
for the step-by-step checklist.

### Quick Start

```bash
./scripts/new-org.sh <org-name>
# Then: drop documents into org-context/<org-name>/
# Then: ask Claude Code to onboard
```

### The 19 ORG-SPECIFIC Files

| # | File | What It Contains |
|---|------|-----------------|
| 1 | `src/lib/config/org-profile.ts` | Legal identity, contact, mission keywords |
| 2 | `src/lib/config/stories.ts` | WHY/HOW/WHAT/EVIDENCE narratives per theme |
| 3 | `src/lib/config/numbers.ts` | Central metrics registry (impact, financial, team) |
| 4 | `src/lib/config/budget-scenarios.ts` | 3-year funding models and projections |
| 5 | `src/lib/config/schwerpunkte.ts` | Strategic focus areas and priorities |
| 6 | `src/lib/config/foundations/metadata.ts` | Theme definitions, NOT_RECOMMENDED list |
| 7 | `src/lib/config/gesuch-templates.ts` | Gesuch document templates |
| 8 | `src/lib/config/fit-scoring.ts` | Priority formula and scoring weights |
| 9 | `src/lib/config/value-cascade.ts` | Value chain specific to org's process |
| 10 | `src/lib/schemas/foundation.ts` | ThemeId enum (org's focus area categories) |
| 11 | `src/app/revamp-2030/page.tsx` | Vision/mission/strategy page |
| 12 | `src/app/strategie/data.ts` | Strategy page data |
| 13 | `src/app/strategie/components.tsx` | Strategy page components |
| 14 | `src/app/team/data.ts` | Team members and roles |
| 15 | `src/app/wie-wir-arbeiten/data.ts` | How we work page data |
| 16 | `src/app/finanzen/FinanzenClient.tsx` | Financial dashboard |
| 17 | `src/app/api/documents/gesuch/[id]/route.tsx` | Gesuch PDF generation |
| 18 | `src/lib/pdf/impact-report/index.tsx` | Wirkungsbericht PDF template (2-page) |
| 19 | `src/lib/pdf/pitch-deck/index.tsx` | Pitch Deck PDF template (8-slide landscape) |

### Claude Onboarding Workflow

1. Read all docs from `org-context/<org-name>/`
2. Extract: legal identity, mission, themes, team, financials, stories
3. Rewrite `org-profile.ts` with new identity
4. Define themes (ThemeId enum + THEMES object in metadata.ts)
5. Rewrite `stories.ts`, `schwerpunkte.ts`, `budget-scenarios.ts`, `numbers.ts`
6. Rewrite `gesuch-templates.ts`
7. Rewrite page content (team, strategy, vision, finanzen)
8. Rewrite PDF templates (`impact-report/index.tsx`, `pitch-deck/index.tsx`) with new org narrative
9. Set `org_id` in `scripts/foundation-upsert.ts`
10. Run screening with new keywords → queue → research → upsert → sync → build

### Input Spec (`org-context/<org-name>/`)

**Required:** Statutes/Satzungen, annual report, website URL
**Recommended:** Budget/financial plan, strategy document
**Helpful:** Past grant applications, partner list, team bios
**Optional:** Photos, branding, logo

---

## Future Direction

### Phase 1 (Current): Revamp-IT — COMPLETE
- Next.js 16 app with TypeScript, Tailwind CSS v4, Zod 4
- Dynamic foundation pages + gesuch workflow + 3-step wizard
- Config-driven data architecture, shared component library
- Foundation pipeline (kanban, applications, status tracking)
- Gesuch PDF (full 4-page) + one-pager + shareable landing page
- HMAC share tokens, middleware auth for internal section

### Phase 2: Document Generation — COMPLETE (2026-04-23)
- ~~Generate Gesuch PDFs~~ — DONE
- ~~One-pager concept note~~ — DONE
- ~~Shareable foundation landing page~~ — DONE
- ~~Pitch deck format~~ — DONE (8-slide landscape A4, `GET /api/documents/pitch-deck`)
- ~~Impact report from live data~~ — DONE (2-page Wirkungsbericht, `GET /api/documents/impact-report`)

### Phase 3: Hirnli — Multi-Tenant Platform

**The model:** Claude Code is the onboarding engine. An org provides context documents
(statutes, annual report, strategy, financials). Claude rewrites the 14 ORG-SPECIFIC files
and deploys a branded instance. No runtime multi-tenancy — each org runs their own deployment.

**What changes per org:**
- The 17 ORG-SPECIFIC files (org-profile, stories, themes, budget, etc.)
- The analysis layer of the foundation DB (fit scores, priorities, researchNotes)
- Branding (logo, colors)

**What stays shared across orgs:**
- The registry layer of the foundation DB (universal foundation facts)
- All platform code, components, schemas
- The Hirnli platform itself (not yet public — Revamp-IT branding only until launch)

**When Phase 3 starts:** After Revamp-IT demonstrates measurable fundraising outcomes
from this tooling. The proof of concept has to work before we scale it.

**Auth in Phase 3:** The middleware password gets replaced by per-org auth (Clerk or
similar). The internal/external page boundary stays the same — only the auth mechanism changes.

---

## Relationship to Other Systems

```
┌─────────────────────────────────────────────────────────────┐
│                     REVAMP-IT ECOSYSTEM                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Kivitendo (Accounting)      revamp-info.orangecat.ch       │
│  ──────────────────────      ─────────────────────────      │
│  • Source financials         • Fundraising intelligence       │
│  • Invoice/revenue data      • Foundation research            │
│  • Export → CSV → site       • Impact dashboards              │
│                                                              │
│  Nextcloud (File Storage)    revampit.orangecat.ch          │
│  ────────────────────────    ────────────────────            │
│  • Team documents            • Public website                 │
│  • KPI frameworks            • Shop, services                 │
│  • HR files                  • User-facing                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

**Last Updated:** 2026-05-28 — run `npm run audit` for live pipeline stats (P1=20/P2=78/P3=142=240, generated=1,683, archived=1,117, P2/P3 appUrl=100%/96%; Gesuch P1=20/20 perfect, P2=70/75=93%, P3=109/117=93% — 199/212 total perfect)
**Maintainer:** Revamp-IT Team
