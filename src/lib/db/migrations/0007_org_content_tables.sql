-- Phase C step 1 (docs/HIRNLI-REPLATFORM-PLAN.md §3.2): org content becomes
-- rows, not code. These tables are the DB home for everything currently in
-- ORG-SPECIFIC TypeScript config files. Seeded from those files for
-- revamp-it (scripts/seed-org-content.ts); readers migrate in a follow-up —
-- until then the TS configs remain the runtime SSOT and these tables mirror
-- them (the seed is idempotent and re-runnable).
--
-- Additive + idempotent; safe against the live shared DB.

CREATE TABLE IF NOT EXISTS "org_profiles" (
  "org_id"      text PRIMARY KEY,
  "profile"     jsonb NOT NULL,            -- OrgProfile shape (Zod-validated at seed/read)
  "branding"    jsonb NOT NULL DEFAULT '{}'::jsonb, -- CSS-var token overrides per tenant
  "default_locale" text NOT NULL DEFAULT 'de',
  "created_at"  timestamptz NOT NULL DEFAULT now(),
  "updated_at"  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "org_content" (
  "org_id"     text NOT NULL,
  "key"        text NOT NULL,              -- e.g. 'stories', 'numbers', 'gesuch-templates'
  "locale"     text NOT NULL DEFAULT 'de',
  "value"      jsonb NOT NULL,
  "version"    integer NOT NULL DEFAULT 1,
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("org_id", "key", "locale")
);

CREATE TABLE IF NOT EXISTS "org_scoring" (
  "org_id"     text PRIMARY KEY,
  "engine"     jsonb NOT NULL,             -- SCORING_ENGINE config (already declarative)
  "readiness"  jsonb NOT NULL,             -- READINESS_ENGINE config
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "org_content_org_idx" ON "org_content" ("org_id");

-- The app connects as the revampit role (shared DB) — it owns these tables
-- like it owns the fundraising_* tables. Without this, hand-applied
-- migrations (run as postgres) leave tables the app cannot write.
ALTER TABLE "org_profiles" OWNER TO revampit;
ALTER TABLE "org_content"  OWNER TO revampit;
ALTER TABLE "org_scoring"  OWNER TO revampit;
