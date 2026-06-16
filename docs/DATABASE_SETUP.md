# Database Setup

## Overview

This project uses **PostgreSQL** (self-hosted) with **Drizzle ORM**.
The DB is the write SSOT for all foundation data — see
[`/CLAUDE.md`](./CLAUDE.md) §"Foundation Database Model" for the full
data flow.

## Prerequisites

- Node.js 20+
- npm
- A PostgreSQL `DATABASE_URL` (ask the team for the shared dev connection
  string, or point at a local Postgres instance)

## Step 1 — Configure Environment

Create `.env.local` in the project root:

```env
DATABASE_URL=postgres://user:pass@host:5432/dbname
INTERNAL_PASSWORD=...    # optional; HTTP Basic auth for /fundraising/*
SHARE_SECRET=...         # required for /gesuch/share/[token] HMAC tokens
```

`.env.local` is gitignored. Never commit credentials.

## Step 2 — Verify connection

The first `npm run dev` runs `npm run sync` (the `predev` hook), which
queries the DB. If that succeeds you're done. The expected output ends
with:

```
  Valid: <N> foundations
  Invalid: 0 foundations (skipped)

Sync complete.
```

## Tables (5)

Defined in [`src/lib/db/schema.ts`](./src/lib/db/schema.ts):

| Table | Purpose |
|-------|---------|
| `fundraising_foundations` | Foundation registry + per-org analysis (16k+ rows). `config_data` JSONB holds the full Zod-validated Foundation shape. |
| `fundraising_applications` | Outreach lifecycle (prospect → accepted/rejected) |
| `fundraising_customization_rules` | Rule-based Gesuch personalization (condition → action) |
| `fundraising_activity_log` | Immutable audit log of all foundation/application changes |
| `fundraising_gesuch_overrides` | Per-(foundation × variant) Gesuch section overrides |

## Schema Migrations

Schema lives in `src/lib/db/schema.ts`. After editing:

```bash
# 1. Export DATABASE_URL inline (drizzle-kit doesn't read .env.local automatically)
export DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d= -f2-)

# 2. Generate the SQL migration file
npx drizzle-kit generate    # writes src/lib/db/migrations/<timestamp>_<name>.sql

# 3. Apply to the DB
npx drizzle-kit push        # pushes diff to the Postgres DB
```

Migration files are commits-of-record — always commit them. Review the
push output before confirming any DROP statements.

## DB Inspection

```bash
npx drizzle-kit studio    # opens visual browser at https://local.drizzle.studio
```

Or query directly via `psql "$DATABASE_URL"`.

## Common Operations

```bash
# Pipeline funnel + gap report
npm run audit

# Schema + duplicate + quality validation
npm run validate:foundations

# Regenerate the read-only TS cache (DB → src/lib/config/foundations/stiftungen-generated.ts)
npm run sync
```

## Troubleshooting

**`DATABASE_URL environment variable is not set`**
Verify `.env.local` exists in project root and `DATABASE_URL` is set.
Restart the dev server.

**Sync reports `Invalid: <N> foundations (skipped)`**
A row's `config_data` JSONB doesn't match the Zod schema. Run
`npm run sync 2>&1 | grep "Invalid:"` then look at the warnings just
above for the validation errors.

**`drizzle-kit push --dry-run` is not supported**
True for v0.31.9 — review the actual `push` output. Cancel if you see
unexpected DROP statements.

## Security

- `.env.local` is gitignored
- `DATABASE_URL` includes credentials — keep secret
- `SHARE_SECRET` controls who can generate /gesuch/share/[token] URLs
- Internal routes are gated by HTTP Basic Auth (see `src/middleware.ts`);
  set `INTERNAL_PASSWORD` in the server environment to enforce it in production
