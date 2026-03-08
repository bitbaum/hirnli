# Revamp-Info — Claude Code Instructions

@~/.claude/CLAUDE.md

See `/CLAUDE.md` in project root for full product vision and engineering guide.

## Quick Reference

**What:** Fundraising intelligence platform (currently Revamp-IT specific, future: universal)
**Core:** Ingest project data → Present beautifully → Find funders → Profile fit → Generate documents
**Stack:** Next.js 16 + TypeScript + Tailwind CSS v4 + Chart.js + Zod 4
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
7. **Org identity from `org-profile.ts`** — never hardcode org name in domain logic or UI chrome. Import from `ORG_PROFILE`. Files marked `ORG-SPECIFIC` contain content that needs rewriting per-org.

## Architecture

```
src/
├── app/                           # Next.js App Router (28 page routes)
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
│   ├── wie-wir-arbeiten/          # How we work (impact methodology)
│   ├── revamp-2030/              # Vision 2030 strategy
│   ├── gesuch/share/[token]/     # Public share pages (HMAC-protected)
│   └── fundraising/
│       ├── page.tsx               # Fundraising hub
│       ├── stiftungen/            # Foundation list + [slug] detail + [slug]/gesuch
│       ├── applications/          # Pipeline management + [id] detail
│       ├── hub/                   # Hub/space planning
│       ├── bildung/               # Education program funding
│       ├── scoring-methodik/      # Scoring methodology
│       └── gesuch-vorlagen/       # Template list + [type] detail
├── components/
│   ├── layout/                    # Nav, Footer, PageHeader, StoryBridge, WhyThisMatters
│   ├── ui/                        # Badge, Button, Card, CTABanner, Tabs, Modal, Table, etc.
│   ├── charts/                    # RevenueChart, CategoryBreakdown, AnnualTrendChart, ChartWrapper
│   ├── foundation/               # FoundationCard, Header, Sidebar, FitAnalysis
│   ├── gesuch/                    # GesuchEditPanel, GesuchSubmitSection, section components
│   ├── fundraising/              # Pipeline, application tracking components
│   ├── budget/                    # Budget visualization components
│   ├── hub/                       # Hub image generator
│   ├── data/                      # Data display components
│   ├── documents/                 # Document management components
│   └── metrics/                   # MetricCard, MetricGrid, NumberInspector
├── lib/
│   ├── schemas/                   # Zod schemas (SSOT for all types)
│   ├── config/                    # foundations/, stories, metrics, nav, gesuch-templates, etc.
│   ├── data/                      # FinanceDataSet + fallback financial data
│   ├── db/                        # Drizzle schema, migrations, queries
│   ├── domain/                    # gesuch-composer, bridge-composer, foundation-filter, etc.
│   ├── pdf/                       # PDF templates (GesuchTemplate, etc.)
│   ├── types/                     # Shared TypeScript types
│   └── utils/                     # formatCHF, formatPercent, share-token, etc.
└── hooks/                         # useFinancialData, useFoundationFilters, useGesuchOverrides, useNumberInspector
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

**DB is write SSOT. Never hand-edit `stiftungen-generated.ts`.**

1. Run `npx tsx scripts/foundation-upsert.ts --slug=<slug>` with config_data
2. Run `npm run sync` → regenerates `stiftungen-generated.ts`
3. Run `npm run build` → dynamic route picks up the new slug automatically
