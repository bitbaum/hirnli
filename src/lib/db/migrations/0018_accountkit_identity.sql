-- Sign-in moves onto @bitbaum/accountkit, the fleet's one account runtime.
--
-- AccountKit is Better Auth with the fleet's methods mounted: passwords as
-- before, plus passkeys and a second factor, which need two tables and one
-- column. It also keeps a platform role on every person (never set by the
-- person; sign-up ignores it). Workspace roles stay in `org_members.role`.
--
-- Existing people, password hashes (scrypt, the same format), organisations
-- and sessions are untouched. Additive and idempotent; safe against the live
-- database.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" text NOT NULL DEFAULT 'customer';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "two_factor_enabled" boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "passkeys" (
  "id"            text PRIMARY KEY,
  "name"          text,
  "public_key"    text NOT NULL,
  "user_id"       text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "credential_id" text NOT NULL UNIQUE,
  "counter"       integer NOT NULL,
  "device_type"   text NOT NULL,
  "backed_up"     boolean NOT NULL,
  "transports"    text,
  "aaguid"        text,
  "created_at"    timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "passkeys_user_id_idx" ON "passkeys" ("user_id");

CREATE TABLE IF NOT EXISTS "two_factors" (
  "id"                        text PRIMARY KEY,
  -- Encrypted with BETTER_AUTH_SECRET before it is stored.
  "secret"                    text NOT NULL,
  "backup_codes"              text NOT NULL,
  "user_id"                   text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "verified"                  boolean DEFAULT true,
  "failed_verification_count" integer DEFAULT 0,
  "locked_until"              timestamptz
);
CREATE INDEX IF NOT EXISTS "two_factors_user_id_idx" ON "two_factors" ("user_id");
CREATE INDEX IF NOT EXISTS "two_factors_secret_idx" ON "two_factors" ("secret");

-- Hand-applied migrations run as `postgres`; without this the app role cannot
-- read the tables it signs people in with.
ALTER TABLE "passkeys" OWNER TO revampit;
ALTER TABLE "two_factors" OWNER TO revampit;
