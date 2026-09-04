-- Grant the application role access to fundraising_foundation_assessments,
-- and stop new tables from arriving unreadable ever again.
--
-- WHAT HAPPENED (2026-09-04, production)
--
-- Migration 0012 created fundraising_foundation_assessments as the migrating
-- role. The application connects as a different, lesser role, and a new table
-- carries no privileges for anybody but its owner. Every foundation read is now
-- a LEFT JOIN onto that table, so every read raised
--
--     42501: permission denied for table fundraising_foundation_assessments
--
-- The repository's read layer caught the error and returned an empty list. The
-- site stayed up, returned HTTP 200 everywhere, and showed a customer with
-- 1,683 researched foundations that it had none. /api/export/foundations served
-- a CSV containing nothing but its header row. Nothing alerted, because from
-- the outside nothing was wrong.
--
-- Two things had to be true for that outage, and both are fixed:
--
--   1. The grant was missing. This migration grants it, and — more usefully —
--      sets default privileges so the NEXT table created by the migrating role
--      is readable by the application without anybody remembering this.
--
--   2. The read layer treated a permanent schema error as a transient outage.
--      foundations-repo.ts now rethrows SQLSTATE class 42 rather than degrading
--      to an empty list, so this class of defect fails loudly instead of
--      quietly lying. See the comment there.
--
-- WHY IT IS WRITTEN THIS WAY
--
-- The application's role name differs per deployment, so it cannot be spelled
-- out here. It is derived instead: the role holding privileges on
-- fundraising_foundations that is not the owner is, by construction, the role
-- the app connects as — that table has been read by the app since long before
-- multi-tenancy. Copying the grantee from an existing table is also what makes
-- this correct on a database this migration has never seen.
--
-- Idempotent, and safe to run when the two tables already agree.

DO $$
DECLARE
  app_role  text;
  owner_role text;
BEGIN
  SELECT relowner::regrole::text INTO owner_role
    FROM pg_class WHERE relname = 'fundraising_foundations';

  -- Every grantee on the reference table except its owner and PUBLIC.
  FOR app_role IN
    SELECT DISTINCT grantee
      FROM information_schema.role_table_grants
     WHERE table_name = 'fundraising_foundations'
       AND grantee NOT IN (owner_role, 'PUBLIC')
  LOOP
    EXECUTE format(
      'GRANT ALL PRIVILEGES ON TABLE fundraising_foundation_assessments TO %I',
      app_role
    );

    -- The class fix. Without this, every future table repeats the outage above
    -- and the only symptom is a page that renders as though the data were gone.
    EXECUTE format(
      'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public '
      'GRANT ALL PRIVILEGES ON TABLES TO %I',
      owner_role, app_role
    );
    EXECUTE format(
      'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public '
      'GRANT ALL PRIVILEGES ON SEQUENCES TO %I',
      owner_role, app_role
    );

    RAISE NOTICE 'granted assessments access to %', app_role;
  END LOOP;

  -- A database where the reference table has no non-owner grantee is one where
  -- the app connects as the owner; nothing to do, and nothing to warn about.
END $$;
