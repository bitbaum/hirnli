# Revamp-Info — Claude Code Instructions

@~/.claude/CLAUDE.md

See `/CLAUDE.md` in project root for full product vision and engineering guide.

## Quick Reference

**What:** Fundraising intelligence platform (currently Revamp-IT specific, future: universal)
**Core:** Ingest project data → Present beautifully → Find funders → Profile fit → Generate documents
**Stack:** Next.js 15 + TypeScript + Tailwind CSS v4 + Chart.js + Zod
**Deploy:** Push to main → Vercel auto-deploys
**URL:** https://revamp-info.vercel.app

## First Principles

1. **Data Transparency** — every number traceable to source (click-to-inspect)
2. **Viewer-First** — primary audience is foundation program officers evaluating us
3. **Foundation Profiles = Presentation Tools** — not just internal research, but shareable
4. **Config-Driven Data** — foundations, stories, metrics in TypeScript config files
5. **1-File Rule** — adding a foundation = 1 data entry in config (dynamic route handles the rest)

## Key Rules

1. **Swiss German** — use "ss" not "ß". **ALWAYS use real umlauts** (ä ö ü) in all user-facing strings. NEVER substitute with ae/oe/ue. This applies to labels, titles, descriptions, button text, placeholder text — everything the user sees. Code identifiers and URL slugs may use ASCII.
2. **Source everything** — cite sources for data/claims
3. **Types from schemas** — derive types via `z.infer<>`, never define separately
4. **SSOT components** — shared component library, no copy-paste
5. **Data in config files** — `lib/config/foundations.ts`, `lib/config/stories.ts`, `lib/config/metrics.ts`
6. **Separation of concerns** — config → domain → hooks → components

## Architecture

```
src/
├── app/                           # Next.js App Router (17 page routes)
│   ├── layout.tsx                 # Root layout (Nav + Footer)
│   ├── page.tsx                   # Dashboard
│   ├── globals.css                # Design tokens + Tailwind v4
│   ├── finanzen/                  # Financial deep dive (8-year P&L)
│   ├── wirkung/                   # Impact metrics
│   ├── methodik/                  # Methodology + transparency report
│   ├── preismodell/               # Solidarity pricing model
│   ├── strategie/                 # Vision, mission, SDGs
│   ├── team/                      # Team & capacity
│   ├── operations/                # SOPs & processes
│   ├── dokumente/                 # Document library
│   └── fundraising/
│       ├── page.tsx               # Fundraising hub
│       ├── stiftungen/            # Foundation list + [slug] detail (37)
│       └── gesuch-vorlagen/       # Template list + [type] detail (11)
├── components/
│   ├── layout/                    # Nav, Footer, PageHeader
│   ├── ui/                        # Badge, Card, FilterBar, Tabs, Modal, Table, CountdownTimer
│   ├── charts/                    # RevenueChart, CategoryBreakdown, AnnualTrendChart, ChartWrapper
│   ├── foundation/                # FoundationCard, FoundationHeader, FoundationSidebar, FitAnalysis
│   ├── gesuch/                    # Gesuch section components (Hero, Why, How, Projects, Evidence, Contact)
│   └── metrics/                   # MetricCard, MetricGrid, NumberInspector, DataSourceBadge
├── lib/
│   ├── schemas/                   # Zod schemas (SSOT for all types)
│   ├── config/                    # Data (foundations, stories, metrics, nav, gesuch-templates)
│   ├── data/                      # FinanceDataSet + fallback financial data
│   ├── domain/                    # Pure business logic (calculations, filters, gesuch-composer)
│   └── utils/                     # Formatting (formatCHF, formatPercent, etc.)
└── hooks/                         # useFinancialData, useFoundationFilters, useNumberInspector
```

## Common Commands

```bash
# Local dev
npm run dev

# Build
npm run build

# Deploy (auto via Vercel on push)
git push
```

## Adding a Foundation

1. Add entry to `src/lib/config/foundations.ts` (data)
2. Done. Dynamic route `[slug]/page.tsx` handles rendering via `generateStaticParams()`.
