-- A foundation row must say whose it is, and the type system should say so too.
--
-- Every other tenant-scoped table already declares `org_id NOT NULL`:
-- applications, customization_rules, activity_log, gesuch_overrides. Only
-- `fundraising_foundations` left it nullable, and that gap had a consequence.
--
-- Until migration 0011 the column carried `default('revamp-it')`, so a write
-- path could omit the tenant and still produce an attributed row — wrongly
-- attributed, but never visibly empty. Dropping that default was correct, and
-- it turned the omission into a NULL: `POST /api/foundations` and
-- `POST /api/foundations/import` both built their insert without `orgId`, so
-- every foundation created through the admin API belonged to nobody. Such a row
-- is invisible to a tenant-scoped read and, after 0012, cannot carry an
-- assessment at all, because fundraising_foundation_assessments.org_id is NOT
-- NULL with a foreign key to a real organisation.
--
-- Both handlers now resolve the tenant per request. This migration makes the
-- next omission impossible rather than merely absent: with the column NOT NULL,
-- Drizzle infers `orgId` as required and an insert that forgets it fails to
-- compile. That is the difference between fixing an instance and ending the
-- class — a grep-based test could only find the shapes I thought to look for,
-- whereas the type checker sees every insert there will ever be.
--
-- Safe on live data: all 16,623 rows already carry an org_id (verified), and
-- all five insert sites — two Drizzle, three raw SQL in the ingestion scripts —
-- set it explicitly.
--
-- Worth stating plainly: this column's days are numbered. Once readers move to
-- fundraising_foundation_assessments, `foundations` is the shared registry and
-- ownership belongs entirely to the assessment row, so `org_id` will be dropped
-- here. Constraining a column that is going away is still worth it — the
-- transition is measured in weeks of work, and unattributed rows written during
-- it would be indistinguishable afterwards.

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fundraising_foundations'
      AND column_name = 'org_id'
      AND is_nullable = 'YES'
  ) THEN
    -- Fail loudly rather than inventing an owner. If a NULL row exists, some
    -- write path is still omitting the tenant, and guessing which organisation
    -- it belonged to is exactly the irreversible mistake this prevents.
    IF EXISTS (SELECT 1 FROM fundraising_foundations WHERE org_id IS NULL) THEN
      RAISE EXCEPTION
        'Cannot require org_id: % row(s) have none. Identify their tenant first — a guess cannot be undone.',
        (SELECT count(*) FROM fundraising_foundations WHERE org_id IS NULL);
    END IF;

    ALTER TABLE fundraising_foundations ALTER COLUMN org_id SET NOT NULL;
  END IF;
END $$;
