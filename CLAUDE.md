# Revamp-Info — Fundraising Intelligence Platform

@~/.claude/CLAUDE.md

---

## Product Vision

### What This Is

A **fundraising intelligence platform** that helps organizations present themselves compellingly to potential funders, find the right foundations, and generate professional application documents.

**Currently:** Built for Revamp-IT as the first use case.
**Future:** A universal platform any project can use to fundraise effectively.

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
| Presentation mode | Working (3 pages) | Clean view for sharing with foundations |
| Traditional Gesuch (PDF) | Planned | Well-designed PDF from same data |
| Pitch Deck | Planned | Visual presentation format |
| Reader-friendly Gesuch | Planned | Better-designed than plain-text standard |
| Impact Report | Planned | Annual report from live data |

### 5. Config-Driven Data

Foundation data, themes, story components, and metrics are all in **TypeScript config files**, not hardcoded in components:

```
lib/config/foundations.ts  → Foundation entries (SSOT — count derived at runtime via STIFTUNGEN_DATA.length)
lib/config/stories.ts      → Narrative building blocks (SSOT)
lib/config/metrics.ts      → Metric metadata (SSOT)
lib/data/financial.ts      → Financial data + FinanceDataSet class
```

Adding a new foundation requires: **1 data entry** in `foundations.ts` (1-file rule — dynamic route handles rendering).

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
4. Reseed foundation DB (new research, fit scores, priorities)
5. Run `npm run sync` to regenerate config
6. Rewrite NOT_RECOMMENDED, schwerpunkte, budget-scenarios
7. Rewrite page content (/revamp-2030, /strategie, /team)
8. Update branding (logo, colors if needed)
9. `npm run build` must pass

---

## Current Architecture

### Tech Stack

```
Next.js 15 + TypeScript + Tailwind CSS v4
├── Next.js App Router    → Layouts, dynamic routes, static generation
├── TypeScript (strict)   → Type safety throughout
├── Tailwind CSS v4       → Utility-first styling with design tokens
├── Zod                   → Schema validation, SSOT for types
├── Chart.js + react-chartjs-2 → Financial visualizations
└── Vercel                → Hosting (auto-deploy from git push)
```

### File Structure

```
revamp-info/
├── CLAUDE.md                          # THIS FILE — product vision + engineering guide
├── vercel.json                        # Deployment config (headers, redirects)
├── src/
│   ├── app/                           # Next.js App Router (17 page routes)
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
│   │   └── fundraising/
│   │       ├── page.tsx               # Fundraising hub
│   │       ├── stiftungen/
│   │       │   ├── page.tsx           # Foundation list (filterable)
│   │       │   └── [slug]/            # Dynamic detail (all STIFTUNGEN_DATA entries)
│   │       │       ├── page.tsx       # Foundation profile
│   │       │       └── gesuch/        # Interactive + PDF gesuch
│   │       └── gesuch-vorlagen/
│   │           ├── page.tsx           # Template list
│   │           └── [type]/            # Template detail (11 types)
│   ├── components/
│   │   ├── layout/                    # Nav, Footer, PageHeader
│   │   ├── ui/                        # Badge, Card, FilterBar, Tabs, Modal, Table, CountdownTimer
│   │   ├── charts/                    # RevenueChart, CategoryBreakdown, ChartWrapper
│   │   ├── foundation/               # FoundationCard, Header, Sidebar, FitAnalysis
│   │   └── metrics/                   # MetricCard, MetricGrid, NumberInspector, DataSourceBadge
│   ├── lib/
│   │   ├── schemas/                   # Zod schemas (foundation, financial, metric, story)
│   │   ├── config/                    # foundations.ts, stories.ts, metrics.ts, nav.ts
│   │   ├── data/                      # FinanceDataSet class + fallback data (2022-2025)
│   │   ├── domain/                    # calculations.ts, foundation-filter.ts, story-composer.ts
│   │   └── utils/format.ts           # formatCHF, formatPercent, etc.
│   └── hooks/                         # useFinancialData, useFoundationFilters, useNumberInspector
├── _legacy_pages/                     # Old HTML pages (archived)
└── _legacy_index.html                 # Old dashboard (archived)
```

### Data Flow

```
Kivitendo (Accounting)  →  CSV Export  →  lib/data/financial.ts (embedded)  →  Dashboard
Foundation Research     →  lib/config/foundations.ts                         →  [slug] route
Impact Methodology      →  lib/config/metrics.ts                            →  Inspectable metrics
Narrative Content       →  lib/config/stories.ts                            →  Foundation stories
```

### SSOT Components

| Component | File | Purpose |
|-----------|------|---------|
| Navigation | `components/layout/Nav.tsx` | App-wide nav via layout.tsx |
| Footer | `components/layout/Footer.tsx` | Footer via layout.tsx |
| Formatting | `lib/utils/format.ts` | CHF, %, number, date formatting |
| Foundation Data | `lib/config/foundations/` | STIFTUNGEN_DATA (batches in stiftungen-*.ts) |
| Story Blocks | `lib/config/stories.ts` | WHY/HOW/WHAT/EVIDENCE narratives |
| Number Metadata | `lib/config/metrics.ts` | Source, formula, confidence per metric |
| Schemas | `lib/schemas/*.ts` | Zod schemas → TypeScript types |

---

## Known Issues & Technical Debt

### Resolved (from previous vanilla JS version)

- ~~Missing minerva page~~ — resolved: dynamic route handles all slugs
- ~~Orphan marketing page~~ — resolved: not migrated (was empty)
- ~~DRY violations (inline scripts, duplicated tabs/timers/charts)~~ — resolved: shared component library
- ~~Dead code (first-principles-analyzer.js)~~ — resolved: not migrated
- ~~No URL state persistence~~ — resolved: `useFoundationFilters` syncs to URL params
- ~~No text search~~ — resolved: search input on foundation list

### Remaining

- No actual downloadable documents (Gesuch PDFs, pitch decks) — Phase 2
- Legacy HTML files still in `_legacy_pages/` and `_legacy_index.html` — safe to delete after verification
- Marketing page content not migrated (was empty/minimal)

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

### Adding a Foundation

1. Add entry to a `stiftungen-*.ts` file in `src/lib/config/foundations/`
2. Include in `STIFTUNGEN_DATA` array in `foundations/index.ts`
3. Done. `generateStaticParams()` automatically includes the new slug.

**Foundation data lives in batches:** `stiftungen-core.ts` (original 37), `stiftungen-2026-02.ts` (70 from Feb 2026 research). New research batches get their own file (`stiftungen-YYYY-MM.ts`) and are spread into `STIFTUNGEN_DATA`.

**Quality gate for `needsResearch: false`:** An entry must have:
- `purposeSummary` (150+ chars, specific focus areas — not just tagline-level)
- `researchNotes` (250+ chars, strategic fit analysis for Revamp-IT)
- `contact` with at least email or phone
- `themes` properly assigned
- `websiteUrl` that resolves

If any of these are missing, the entry must keep `needsResearch: true`.

**Gesuch pages are only generated** for entries with `needsResearch: false` AND `priority <= 2` (see `generateGesuchParams()` in `foundation-helpers.ts`).

**NEVER hardcode foundation/template counts** in UI text or documentation. Always derive from `STIFTUNGEN_DATA.length` or equivalent. Counts go stale the moment a new batch is added.

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

## Future Direction

### Phase 1 (Current): Revamp-IT Specific — COMPLETE
- Next.js 15 app with TypeScript, Tailwind, Zod
- 17 page routes + dynamic foundation pages (STIFTUNGEN_DATA.length) + 18 gesuch templates
- Config-driven data architecture
- Shared component library (20+ components)
- URL-synced filter state
- Click-to-inspect metric transparency

### Phase 2: Document Generation
- Generate PDFs from live data (Gesuch, pitch deck, impact report)
- Better-designed Gesuch templates (not plain-text)
- API routes at `app/api/documents/[type]/route.ts`
- `@react-pdf/renderer` for PDF generation

### Phase 3: Universal Platform
- Multi-project support (any organization can use this)
- Data ingestion API (upload financials, impact data, team info)
- Dynamic foundation matching based on project profile
- User accounts, saved searches, application tracking

The architecture supports Phase 2-3 evolution. Config files naturally namespace into `config/projects/revamp-it/`. Schemas and components are project-agnostic. Add database + auth when actual multi-project need arises (YAGNI).

---

## Relationship to Other Systems

```
┌─────────────────────────────────────────────────────────────┐
│                     REVAMP-IT ECOSYSTEM                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Kivitendo (Accounting)      revamp-info.vercel.app         │
│  ──────────────────────      ─────────────────────────      │
│  • Source financials         • Fundraising intelligence       │
│  • Invoice/revenue data      • Foundation research            │
│  • Export → CSV → site       • Impact dashboards              │
│                                                              │
│  Nextcloud (File Storage)    revampit.vercel.app             │
│  ────────────────────────    ────────────────────            │
│  • Team documents            • Public website                 │
│  • KPI frameworks            • Shop, services                 │
│  • HR files                  • User-facing                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

**Last Updated:** 2026-02-09
**Maintainer:** Revamp-IT Team
