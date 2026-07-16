# Foundation Pipeline Scripts

CLI tools that feed the foundation database, audit data quality, and
manage the research pipeline. UI/domain code lives in `src/`; everything
here is operations.

> **The DB is the write SSOT.** Foundation data flows: research → DB
> (`fundraising_foundations.config_data`) → `npm run sync` →
> `src/lib/config/foundations/stiftungen-generated.ts` → UI. See
> `/CLAUDE.md` for the full data-flow diagram.

---

## Quick reference (npm aliases)

| Command | Script | Purpose |
|---------|--------|---------|
| `npm run sync` | `src/scripts/sync-foundations.ts` | DB → generated TS file (runs as prebuild/predev) |
| `npm run audit` | `audit-pipeline.ts` | Pipeline funnel + gap report |
| `npm run validate:foundations` | `foundation-validate.ts` | Schema + duplicate + quality validation |
| `npm run foundation:add` | `foundation-add.ts` | Interactive entry generator |
| `npm run esa:download` | `esa-download-and-parse.ts` | Pull ESA register snapshot |
| `npm run zefix:download` | `zefix-download.ts` | Pull Zefix register data |
| `npm run zefix:ingest` | `zefix-ingest.ts` | Bulk-import from Zefix snapshot |
| `npm run zhaw:ingest` | `zhaw-ingest.ts` | ZHAW register-text ingest |
| `npm run screen` | `foundation-screen.ts` | Phase-1 LLM screening |
| `npm run research:queue` | `foundation-research-queue.ts` | Build research candidate queue |
| `npm run research:foundation` | `foundation-research-assistant.ts` | Per-foundation research prompt |
| `npm run research:batch` | `foundation-batch-research.ts` | Batch research prompt set |
| `npm run pipeline:incremental` | `pipeline-incremental.ts` | Incremental graduation pass |
| `npm run pipeline:graduate` | `pipeline-graduate.ts` | Phase-2 LLM graduation |
| `npm run pipeline:triage` | `ingest-triage.ts` | Triage research-result batches |
| `npm run pipeline:upsert` | `foundation-upsert.ts` | Single-foundation upsert |
| `npm run enrich:bulk` | `bulk-enrich.ts` | Bulk enrichment runner |
| `npm run sync-numbers` | `sync-org-numbers.ts` | Refresh ORG_PROFILE numbers |

## Tools without npm aliases (invoke via `npx tsx`)

| Script | Purpose |
|--------|---------|
| `bulk-import-batches.ts` | Import all `research/chatgpt-results/batch*.json` files (idempotent) |
| `dedupe-by-uid.ts` | Merge active foundations sharing a Swiss commercial-register UID |
| `gesuch-audit.ts` | Quality-check Gesuch documents (bridge text, themes, contact, notes) |
| `auto-research.ts` | Programmatic research helper (used by `pipeline-graduate.ts`) |
| `web-enrich.ts` | Website-scrape contact extraction (used by `lib/contact-extractor.ts`) |
| `research-agent.ts` | 4-phase manual enrichment (DISCOVER → VERIFY → EXTRACT → RECONCILE) |
| `new-org.sh` | Bootstrap onboarding for a new tenant org |
| `audit-themes.ts` | Audit theme assignments for P1+P2 foundations |
| `set-confidence.ts` | Set `data_confidence` from research depth (supports `--dry-run`) |

## Library code

`scripts/lib/` holds shared helpers:
- `db.ts` — pg-backed `sql` tagged-template client (all scripts connect through this; needs the DB tunnel from a dev machine — see `docs/DEPLOYMENT.md`)
- `groq-client.ts` — Groq API wrapper for LLM calls
- `theme-classifier.ts` — Keyword-based theme classification (SSOT for theme rules)
- `contact-extractor.ts` — Email/phone extraction patterns

## Data flow

```
zefix-download → zefix-ingest        ┐
zhaw-ingest                          ├─→ DB (fundraising_foundations)
esa-download-and-parse               │       │
research:queue → research:batch      │       │
  → ChatGPT/Claude → research/chatgpt-results/batch*.json
  → bulk-import-batches.ts           ┘       │
                                             ↓
                                       npm run sync
                                             ↓
                           src/lib/config/foundations/stiftungen-generated.ts
                                             ↓
                                            UI
```

## Data integrity rules

Per `/CLAUDE.md`:
- **Never auto-write unverified data to the DB** without provenance tracking
- **DB is write SSOT** — never hand-edit `stiftungen-generated.ts`
- **Quality gate** is enforced by `validateFoundationQuality` in
  `src/lib/domain/foundation-quality.ts` — uses computed
  `isResearched(f)` (tier ≥ profiliert) and `QUALITY_THRESHOLDS` from
  `src/lib/config/fit-scoring.ts`. The stored `needsResearch` boolean
  is deprecated.

## Recent cleanup

The directory was 90 scripts in early 2026-04. Three cleanup commits
(cc51c61, b2f8156, eb5675c) removed 62 dead scripts (-5,672 lines):
underscore-prefixed throwaways, dated single-batch operations,
superseded duplicates, and exploratory rescore experiments. Surviving
scripts are either invoked from `package.json`, called by other
scripts, or are intentional manual-run tools.
