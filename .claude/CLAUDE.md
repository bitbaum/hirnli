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

1. **Swiss German** — use "ss" not "ß", umlauts are OK
2. **Source everything** — cite sources for data/claims
3. **Types from schemas** — derive types via `z.infer<>`, never define separately
4. **SSOT components** — shared component library, no copy-paste
5. **Data in config files** — `lib/config/foundations.ts`, `lib/config/stories.ts`, `lib/config/metrics.ts`
6. **Separation of concerns** — config → domain → hooks → components

## Architecture

```
src/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Root layout (Nav + Footer)
│   ├── page.tsx                   # Dashboard
│   ├── globals.css                # Design tokens + Tailwind v4
│   ├── finanzen/page.tsx          # Financial deep dive
│   ├── kennzahlen/page.tsx        # 28 KPIs across 6 dimensions
│   ├── wirkung/page.tsx           # Impact metrics
│   ├── methodik/page.tsx          # Calculation methodology
│   ├── transparenz/page.tsx       # Data integrity report
│   ├── preismodell/page.tsx       # Solidarity pricing model
│   ├── strategie/page.tsx         # Vision, mission, SDGs
│   ├── team/page.tsx              # Team & capacity
│   ├── operations/page.tsx        # SOPs & processes
│   ├── dokumente/page.tsx         # Document library
│   └── fundraising/
│       ├── page.tsx               # Fundraising hub
│       └── stiftungen/
│           ├── page.tsx           # Filterable foundation list
│           └── [slug]/page.tsx    # Dynamic foundation detail (37 foundations)
├── components/
│   ├── layout/                    # Nav, Footer, PageHeader
│   ├── ui/                        # Badge, Card, FilterBar, Tabs, Modal, Table, CountdownTimer
│   ├── charts/                    # RevenueChart, CategoryBreakdown, ChartWrapper
│   ├── foundation/                # FoundationCard, FoundationHeader, FoundationSidebar, FitAnalysis
│   └── metrics/                   # MetricCard, MetricGrid, NumberInspector, DataSourceBadge
├── lib/
│   ├── schemas/                   # Zod schemas (SSOT for all types)
│   ├── config/                    # Data (foundations, stories, metrics, nav)
│   ├── data/                      # FinanceDataSet + fallback financial data
│   ├── domain/                    # Pure business logic (calculations, filters, story-composer)
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
