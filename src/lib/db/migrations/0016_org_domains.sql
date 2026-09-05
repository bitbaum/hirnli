-- Which host belongs to which tenant becomes DATA.
--
-- It lived in `HOST_TENANTS`, a TypeScript object literal, so adding a customer
-- meant editing, reviewing and deploying the application. A platform that has
-- to be rebuilt to take on a customer is not a platform, and the map was also
-- the last place a tenant's identity was hard-coded outside its own row.
--
-- Middleware runs on the Edge runtime and cannot reach this table, so it no
-- longer resolves the tenant at all: it forwards the normalised Host and
-- `getCurrentOrgId()` does the lookup in the Node runtime, cached per request.
--
-- Additive and idempotent; safe against the live database.

CREATE TABLE IF NOT EXISTS "org_domains" (
  "host"       text PRIMARY KEY,
  "org_id"     text NOT NULL REFERENCES "org_profiles"("org_id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "org_domains_org_idx" ON "org_domains" ("org_id");

-- The two hosts that were in the code map. Stated here once so the cutover is
-- a data move rather than a behaviour change.
INSERT INTO "org_domains" ("host", "org_id") VALUES
  ('revamp-info.orangecat.ch', 'revamp-it'),
  ('evig.hirnli.orangecat.ch', 'evig')
ON CONFLICT ("host") DO NOTHING;

-- Hand-applied migrations run as `postgres`; without this the app role cannot
-- read the table it is meant to route on.
ALTER TABLE "org_domains" OWNER TO revampit;
