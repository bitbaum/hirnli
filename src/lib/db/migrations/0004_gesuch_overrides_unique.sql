-- Add unique constraint on (foundation_id, org_id, variant_key) for gesuch_overrides.
--
-- Without this, PUT/PATCH /api/gesuch-overrides/[slug] could race: two concurrent
-- saves both observe "no row exists" via SELECT, then both INSERT, producing
-- orphan duplicate rows. Subsequent GET reads .limit(1) and silently hides one.
--
-- The constraint enables atomic INSERT ... ON CONFLICT (...) DO UPDATE in the
-- handlers, eliminating the SELECT-then-write race entirely.
--
-- Pre-flight check (run 2026-05-27): zero duplicate groups exist in production
-- (7 rows total, all distinct (foundation_id, org_id, variant_key) tuples).
-- So adding the constraint will succeed without prior cleanup.

ALTER TABLE "fundraising_gesuch_overrides"
  ADD CONSTRAINT "gesuch_overrides_unique_foundation_org_variant"
  UNIQUE ("foundation_id", "org_id", "variant_key");
