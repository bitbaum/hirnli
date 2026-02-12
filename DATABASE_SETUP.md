# Database Setup Instructions

## Overview

This project uses **Turso** (hosted SQLite) with **Drizzle ORM** for the fundraising automation database.

## Prerequisites

- Node.js 20+
- npm
- Turso account (free tier: https://turso.tech/)

## Step 1: Create Turso Database

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login to Turso
turso auth login

# Create database
turso db create revamp-fundraising

# Get database URL
turso db show revamp-fundraising

# Create auth token
turso db tokens create revamp-fundraising
```

## Step 2: Configure Environment Variables

Create `.env.local` in project root:

```bash
# Copy example file
cp .env.local.example .env.local

# Edit with your credentials
nano .env.local
```

Add your Turso credentials:

```env
DATABASE_URL=libsql://[your-database].turso.io
DATABASE_AUTH_TOKEN=[your-token-from-step-1]
CRON_SECRET=[generate-random-string]
```

## Step 3: Push Database Schema

```bash
# Push schema to Turso (creates all tables)
npm run db:push
```

This creates 5 tables:
- `foundations` — 189+ foundation entries
- `applications` — Application tracking
- `customization_rules` — Gesuch personalization rules
- `activity_log` — Full audit trail
- `contacts` — Contact validation

## Step 4: Run Migration

Import existing foundation data (107 TypeScript + 82 JSON):

```bash
npm run migrate
```

Expected output:
```
✓ Migrated 107 TypeScript foundations
✓ foundation-rapid-assessment-batch-1.json — imported 14 new foundations
✓ foundation-rapid-assessment-batch-2.json — imported 18 new foundations
...
✓ Total JSON foundations imported: 82

📊 Verifying migration...
Total foundations: 189
High-fit (score ≥7): 42
Deep research: 20
Missing contact info: 93
```

## Step 5: Verify Database

```bash
# Open Drizzle Studio (visual database browser)
npm run db:studio
```

Visit `https://local.drizzle.studio` to inspect data.

## Database Commands Reference

```bash
# Development
npm run db:push          # Push schema changes to database
npm run db:studio        # Open visual database browser

# Migrations (production)
npm run db:generate      # Generate migration SQL from schema changes
npm run db:migrate       # Apply migrations to database

# Data import
npm run migrate          # Import foundation data (run once)
```

## Schema Overview

### Foundations Table
- **Purpose**: Single source of truth for all foundation data
- **Size**: ~189 entries (107 legacy TypeScript + 82 JSON research)
- **Key fields**: name, fitScore, priority, grantRange, contactEmail, focusAreas

### Applications Table
- **Purpose**: Track outreach lifecycle (prospect → accepted/rejected)
- **Statuses**: prospect, research, draft, review, submitted, pending, followup, accepted, rejected, withdrawn, onhold
- **Links to**: foundations (via foundationId)

### Customization Rules Table
- **Purpose**: Rule-based Gesuch personalization engine
- **Pattern**: Condition (when) → Action (what to do)
- **Examples**:
  - If focus_match = "circular economy" → emphasize_narrative = "285kg CO2 saved"
  - If grant_size < CHF 50k → show_budget_module = "single module"

### Activity Log Table
- **Purpose**: Immutable audit trail
- **Tracks**: All actions on foundations/applications (created, updated, status_changed, etc.)
- **Fields**: entityType, entityId, actionType, actionDetails (JSON), performedBy, timestamp

### Contacts Table
- **Purpose**: Email/phone validation + communication history
- **Supports**: Multiple contacts per foundation
- **Fields**: contactType (email/phone/linkedin), validated, isPrimary, notes

## Troubleshooting

### Error: "DATABASE_URL environment variable is not set"
- Check `.env.local` exists in project root
- Verify DATABASE_URL is set correctly
- Restart dev server: `npm run dev`

### Error: "SQLITE_ERROR: no such table: foundations"
- Run: `npm run db:push` to create tables

### Error: Migration fails with "UNIQUE constraint failed"
- Database already contains data
- Either:
  1. Drop database and recreate: `turso db destroy revamp-fundraising && turso db create revamp-fundraising`
  2. Or skip migration (data already imported)

### Data looks incomplete in Drizzle Studio
- Verify migration completed: check console output
- Count foundations: Should see ~189 total
- If missing: re-run `npm run migrate`

## Next Steps

After database setup:

1. **Phase 2**: Build API endpoints (`/api/foundations`, `/api/applications`)
2. **Phase 3**: Create Kanban board UI
3. **Phase 4**: Implement personalization engine
4. **Phase 5**: Set up deadline monitoring cron
5. **Phase 6**: Add PDF generation
6. **Phase 7**: Build data quality monitoring

See `CLAUDE.md` and implementation plan for full details.

## Security Notes

- `.env.local` is gitignored (never commit credentials)
- DATABASE_AUTH_TOKEN provides full database access (keep secret)
- CRON_SECRET protects automated endpoints (use strong random string)
- Turso free tier: 9 GB storage, 500 databases, unlimited reads

## Resources

- Turso Docs: https://docs.turso.tech/
- Drizzle ORM: https://orm.drizzle.team/
- Drizzle Studio: https://orm.drizzle.team/drizzle-studio/overview
