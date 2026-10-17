# Hirnli — Fundraising Intelligence Platform

> Turn thousands of Swiss foundations into a focused, actionable pipeline, then
> generate a tailored Gesuch for each one in seconds.

Hirnli helps mission-driven organizations find the right foundation funders, build
per-foundation fit narratives, and ship professional German-language applications
(Gesuche) that stand out from the templated norm. Multi-tenant by design — one
deployment serves each organization's branded site on its own host.

[Architecture & Conventions](./CLAUDE.md) · [Scripts Reference](./scripts/README.md) · [Onboarding a New Org](./org-context/README.md)

---

## The funnel

Counts as the live tenant site shows them on 2026-10-02
([pipeline-methodik](https://revamp-info.orangecat.ch/fundraising/pipeline-methodik));
`pnpm run audit` prints the current figures from the database.

```
        Swiss universe (Zefix)           ~16,900
                ↓
        In the register (imported)         1,683   — 1,675 with a fit score
                ↓ researched
        Actionable (P1–P3)                   233   — P1=20, P2=78, P3=135
                ↓ assembled
        Gesuch pages                         212
```

Contact data and websites are never guessed: automated enrichment is forbidden
after the 2026-04-07 incident where guessed URLs were 54% wrong. See the
data-integrity rules in [CLAUDE.md](./CLAUDE.md).

---

## The product

1. **INGEST** — Zefix register + ESA + Fundraiso + StiftungSchweiz feeds, deduped
   into one Foundation entity per legal Stiftung. DB-write SSOT, Zod-validated.
2. **TRIAGE** — Groq-hosted LLM scores every active row from raw Zefix text
   alone, producing a `fitScore` (0–10) + `priority` (P1–P4).
3. **RESEARCH** — Operator-driven deep research for promising candidates pulls
   websites, grant ranges, deadlines, past grantees, contact channels.
4. **PRESENT** — Each foundation gets a public-feeling detail page that doubles
   as a relationship tool: fit analysis, trust badge, sources, recherche links.
5. **GENERATE** — Per-foundation × per-Schwerpunkt × per-template Gesuch composer
   produces: 4-page Gesuch PDF, one-pager concept note, shareable HMAC landing
   page, pitch deck (8-slide A4 landscape), and 2-page impact report — all from
   one Foundation entry + ORG_PROFILE config.

---

## Engineering at a glance

| Signal | Value |
|--------|-------|
| Tests | Vitest — `pnpm test` |
| Type safety | **0 errors**, **0 `any`**, **0 `@ts-ignore`** in `src/` |
| Lint | **0 errors** (ESLint flat config) |
| CI | `pnpm run verify` (format + lint + umlaut lint + typecheck + tests) + build on every push (GitHub Actions) |
| Design tokens | All in `globals.css` (`@theme inline`) — zero hex literals in components |
| Dark mode | Fully wired via `next-themes` + semantic two-tier token system |
| Security | Accounts via Better Auth; explicit modes for the internal area (Basic Auth / public demo / fail-closed default); HMAC share tokens; security headers on every response |
| Multi-tenant | Per-request tenant resolution (Host header → `org_domains` row); per-org analysis in `fundraising_foundation_assessments`; tenant identity in `org_profiles` |
| Deploy | Self-hosted on Hetzner (Caddy + Next.js `standalone` output) — [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) |

Every page that ships data shows a click-to-inspect "where did this number come
from" modal. Every metric traces back to a `NUMBERS_REGISTRY` entry with source,
formula, and confidence level. No black boxes.

---

## Tech stack

- **Next.js 16** App Router · **TypeScript** strict
- **PostgreSQL** (self-hosted, `node-postgres` driver) · **Drizzle ORM** — schema is SSOT
- **Zod 4** — types derived via `z.infer<>`, never defined separately
- **Tailwind v4** — design tokens via `@theme inline` in `globals.css`
- **Chart.js** for finance dashboards · **`@react-pdf/renderer`** for PDFs
- **Groq** (Llama 3.x) — LLM triage + rewrite (configurable, rate-limit aware)
- **Hetzner** — self-hosted behind Caddy, Next.js `standalone` server output

---

## Quick start

```bash
pnpm install
pnpm run dev         # http://localhost:3000  (foundation data reads live from the DB)
pnpm test            # Vitest suite
pnpm run audit       # live pipeline + Gesuch funnel report
pnpm run build       # production build (no DB access needed)
```

Internal routes (`/fundraising/*`, `/api/*`) support HTTP Basic Auth via
[`src/middleware.ts`](./src/middleware.ts) — set `INTERNAL_PASSWORD` in the
server environment, or `INTERNAL_AUTH=off` for a fully public deployment
(the current demo-phase setting). `/gesuch/share/[token]` is always public,
with HMAC-SHA256 tokens for sending foundation-specific content to program
officers.

---

## Repository structure

```
src/
├── app/                # Next.js App Router (route groups: (tenant), (platform), (share), /o)
├── components/         # UI: layout, foundation, fundraising, gesuch, charts, ui
├── lib/
│   ├── schemas/        # Zod — SSOT for every type
│   ├── config/         # Foundations, stories, metrics, numbers, themes (org-specific)
│   ├── db/             # Drizzle schema + migrations + Postgres client
│   ├── domain/         # Pure business logic (scoring, composing, filtering)
│   ├── pdf/            # @react-pdf/renderer templates (Gesuch, pitch deck, impact)
│   └── utils/          # Format, errors, share-token, a11y, slug
└── hooks/              # useFinancialData, useFoundationFilters, useGesuchOverrides

scripts/                # pipeline + ops scripts (ingest, triage, research, audit)
docs/                   # KNOWLEDGE_ARCHITECTURE, DATABASE_SETUP, design guides
org-context/            # New-org onboarding inputs (per-tenant)
public/documents/       # Source documents (anonymised) — SSOT for displayed numbers
```

---

## Project status

| Phase | Status | What it means |
|-------|--------|---------------|
| **1 — Revamp-IT MVP** | ✅ Shipped | Dashboards, foundation list, Gesuch workflow, pipeline kanban |
| **2 — Document generation** | ✅ Shipped | Gesuch PDF (4-page), one-pager, share landing, pitch deck (8-slide), impact report |
| **3 — Multi-tenant (Hirnli)** | 🚧 In progress | One deployment serves multiple tenant hosts (Host → tenant resolution); accounts via Better Auth (email+password, organisation plugin) with org-scoped routing at `/o/<slug>/`; org content migrating from ORG-SPECIFIC files to DB rows. |

The architecture is multi-tenant-by-construction: the foundation **registry**
layer (universal Swiss-foundation facts) is independent from the **analysis**
layer (one org's fit scores and research notes), so adding a tenant means
rewriting analysis + branding, not re-doing the registry.

---

## Documentation

- **[`CLAUDE.md`](./CLAUDE.md)** — full product vision, scoring model, schema, data flow, conventions
- **[`scripts/README.md`](./scripts/README.md)** — pipeline tools and their pnpm aliases
- **[`org-context/_template/README.md`](./org-context/_template/README.md)** — multi-tenant onboarding checklist
- **[`docs/KNOWLEDGE_ARCHITECTURE.md`](./docs/KNOWLEDGE_ARCHITECTURE.md)** — 3-tier SSOT governance
- **[`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)** — self-hosted Hetzner deploy procedure, env, crons, migrations
- **[`docs/DATABASE_SETUP.md`](./docs/DATABASE_SETUP.md)** — PostgreSQL + Drizzle local-dev setup
- **[`public/documents/README.md`](./public/documents/README.md)** — anonymised source document library

---

## License

MIT — see [`LICENSE`](./LICENSE).
