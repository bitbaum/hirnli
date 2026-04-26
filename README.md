# Revamp-Info

Fundraising intelligence platform for Revamp-IT — foundation research,
Gesuch generation, financial transparency, and impact dashboards.

## What This Is

Internal Next.js app for the Revamp-IT team that helps present the org
compellingly to potential funders, find the right foundations, and
generate professional application documents.

The full vision, scoring model, data flow, and engineering principles
live in [`/CLAUDE.md`](./CLAUDE.md). This file is just the quick start.

## Stack

- **Next.js 16** (App Router) — TypeScript, Tailwind v4
- **PostgreSQL** (Neon) via **Drizzle ORM** — write SSOT for foundation data
- **Zod 4** — schema validation, type derivation
- **Chart.js** + `@react-pdf/renderer` — financial dashboards + Gesuch PDFs
- **Vercel** — auto-deploy on push to `main`

## Quick Start

```bash
npm install
npm run dev          # http://localhost:3000  (runs npm run sync first)
```

## Common Commands

| Command | What it does |
|---------|---|
| `npm run dev` | Start dev server (auto-syncs DB → generated TS) |
| `npm run build` | Production build (auto-syncs first) |
| `npm test` | Run Vitest suite |
| `npm run lint` | ESLint |
| `npm run sync` | DB → `stiftungen-generated.ts` |
| `npm run audit` | Pipeline funnel + gap report |
| `npm run validate:foundations` | Schema + duplicate + quality validation |

`scripts/README.md` lists all 28+ pipeline tools and their npm aliases.

## Routes

```
/                          Dashboard
/finanzen                  Financial deep dive (8-year P&L)
/wirkung                   Impact metrics
/methodik                  Methodology & transparency
/preismodell               Solidarity pricing
/strategie                 Vision, mission, SDGs
/team                      Team & capacity
/operations                SOPs & processes
/dokumente                 Document library
/wie-wir-arbeiten          Impact methodology
/revamp-2030               Vision 2030
/fundraising/              Fundraising hub
  ├── stiftungen           Foundation list + [slug] detail + /gesuch
  ├── applications         Pipeline kanban + tracking
  ├── hub                  Hub/space planning
  ├── bildung              Education program
  ├── scoring-methodik     Scoring transparency
  └── gesuch-vorlagen      Gesuch templates
/gesuch/share/[token]      Public Gesuch share page (HMAC token)
```

## Authentication

`src/middleware.ts` gates internal routes (`/fundraising/*`, `/api/*`)
behind HTTP Basic Auth. Set `INTERNAL_PASSWORD` in Vercel env vars; if
unset, all routes are open (local dev). The browser handles the prompt
— no login page, no sessions.

`/gesuch/share/[token]` is intentionally public — the controlled
channel for sending foundation-specific content to program officers.

## Deployment

Push to `main` → Vercel auto-deploys. Live at <https://revamp-info.vercel.app>.

## Related Projects

- [**revampit.vercel.app**](https://revampit.vercel.app) — public website + shop + services
- **This site** — internal dashboards, research, and Gesuch generation

## Documentation

- [`CLAUDE.md`](./CLAUDE.md) — full product vision, scoring model, schema, data flow, conventions
- [`scripts/README.md`](./scripts/README.md) — pipeline scripts reference
- [`org-context/_template/README.md`](./org-context/_template/README.md) — multi-tenant onboarding (Phase 3)
- `research/PIPELINE-LEARNINGS.md` — historical pipeline notes
