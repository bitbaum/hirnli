-- Multi-tenant readiness: every table row must carry its org.
-- fundraising_foundations and fundraising_gesuch_overrides already have
-- org_id; this brings applications, customization_rules, and activity_log
-- to parity so a future second tenant needs no backfill migration.
--
-- All statements are additive (new nullable-with-default columns + indexes),
-- safe against a live DB, and idempotent.

ALTER TABLE "fundraising_applications"
  ADD COLUMN IF NOT EXISTS "org_id" text NOT NULL DEFAULT 'revamp-it';

ALTER TABLE "fundraising_customization_rules"
  ADD COLUMN IF NOT EXISTS "org_id" text NOT NULL DEFAULT 'revamp-it';

ALTER TABLE "fundraising_activity_log"
  ADD COLUMN IF NOT EXISTS "org_id" text NOT NULL DEFAULT 'revamp-it';

CREATE INDEX IF NOT EXISTS "fund_applications_org_idx"
  ON "fundraising_applications" ("org_id");

CREATE INDEX IF NOT EXISTS "fund_customization_rules_org_idx"
  ON "fundraising_customization_rules" ("org_id");

CREATE INDEX IF NOT EXISTS "fund_activity_log_org_idx"
  ON "fundraising_activity_log" ("org_id");
