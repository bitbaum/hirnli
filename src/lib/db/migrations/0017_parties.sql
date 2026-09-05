-- Foundations become parties on the platform, not just rows in a register.
--
-- The model so far had one kind of account: an organisation that seeks funding.
-- Foundations existed only as 16,623 rows of researched public data that
-- customers formed opinions about. But a foundation is a party too — it has a
-- purpose, focus areas, deadlines and an application process, all of which it
-- knows better than anyone researching it from outside, and it will eventually
-- have people who sign in and maintain them.
--
-- Two additions, deliberately separate:
--
--   organizations.kind        what sort of party an ACCOUNT is. 'seeker' looks
--                             for funding, 'funder' gives it. Everything that
--                             exists today is a seeker, hence the default.
--   organizations.foundation_id  which register entry a funder account speaks
--                             for. NULL for seekers, unique for funders: two
--                             accounts must not both claim one foundation.
--
--   funder_profiles           what a foundation says about ITSELF, as opposed
--                             to what the register says about it.
--
-- Why a separate profile table rather than reusing org_profiles: that table is
-- validated by `storedTenantProfileSchema` on every read, and a funder's shape
-- is different (no founding year or mission areas; a purpose, focus areas and
-- an application process instead). Putting both in one jsonb column would mean
-- a reader that cannot know which schema applies until it has already read the
-- row, and a funder row that breaks every seeker page if the guess is wrong.
--
-- Why keyed by foundation_id rather than org_id: the profile belongs to the
-- FOUNDATION, which exists in the register long before anyone claims it. That
-- lets the platform hold a foundation's own words the moment they are known —
-- from an email, a phone call — without waiting for an account to exist.
--
-- Additive and idempotent; safe against the live database.

ALTER TABLE "organizations"
  ADD COLUMN IF NOT EXISTS "kind" text NOT NULL DEFAULT 'seeker';

ALTER TABLE "organizations"
  ADD COLUMN IF NOT EXISTS "foundation_id" text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'organizations_kind_check'
  ) THEN
    ALTER TABLE "organizations"
      ADD CONSTRAINT "organizations_kind_check" CHECK ("kind" IN ('seeker', 'funder'));
  END IF;
END $$;

-- A funder account speaks for exactly one foundation, and a foundation is
-- spoken for by at most one account. Partial, so the many seekers with NULL do
-- not collide with each other.
CREATE UNIQUE INDEX IF NOT EXISTS "organizations_foundation_uidx"
  ON "organizations" ("foundation_id")
  WHERE "foundation_id" IS NOT NULL;

-- An account claiming a foundation must claim one that exists.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'organizations_foundation_fk'
  ) THEN
    ALTER TABLE "organizations"
      ADD CONSTRAINT "organizations_foundation_fk"
      FOREIGN KEY ("foundation_id") REFERENCES "fundraising_foundations"("id")
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "funder_profiles" (
  "foundation_id" text PRIMARY KEY
    REFERENCES "fundraising_foundations"("id") ON DELETE CASCADE,
  "profile"       jsonb NOT NULL,
  -- Whether the foundation itself has confirmed this. Until then it is the
  -- platform's best understanding, and must not be presented as the
  -- foundation's own word.
  "confirmed_at"  timestamptz,
  "updated_at"    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "funder_profiles_confirmed_idx"
  ON "funder_profiles" ("confirmed_at");

ALTER TABLE "funder_profiles" OWNER TO revampit;
