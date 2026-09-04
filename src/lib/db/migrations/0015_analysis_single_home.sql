-- Give every analysis field exactly one home.
--
-- Since 0012 an organisation's assessment of a foundation — fit, priority,
-- themes, tagline, research notes, dates and depth — lives in
-- fundraising_foundation_assessments. But 0012 COPIED those values out without
-- removing them, and left four flat columns on the shared registry table. So
-- each one existed in three places at once:
--
--   fundraising_foundations.config_data->>'fitScore'   (the blob)
--   fundraising_foundations.fit_score                  (a flat column)
--   fundraising_foundation_assessments.fit_score       (the real one)
--
-- Two of those three are per-organisation values stored on a table shared by
-- every tenant. They cannot be right for more than one customer at a time, and
-- the drift they invite is not hypothetical: migration 0003 exists because 535
-- production rows had a blob and a column disagreeing about the same number.
--
-- This migration removes the blob copy. 0016 drops the columns, separately,
-- because dropping a column is not reversible by re-running anything and the
-- deploy tooling is right to want a human present for it.
--
-- WHY THE BLOB COPY IS ACTIVELY DANGEROUS, NOT MERELY REDUNDANT
--
-- The read composes a foundation as "registry fields from config_data, analysis
-- fields from this organisation's assessment row", and has to DELETE the blob's
-- analysis keys before merging (see ANALYSIS_FIELDS in schemas/foundation.ts).
-- Without that deletion, a tenant with no assessment of a foundation would see
-- the blob's leftovers show through — and those leftovers are Revamp-IT's fit
-- scores and its private research notes, which say things like "Übereinstimmung
-- mit Revamp-IT-Themen (Fit 2/3)". One customer's confidential analysis would
-- render as another's own. The deletion is load-bearing today; after this
-- migration there is nothing left to leak.
--
-- SAFE TO APPLY BEFORE THE CODE SHIPS, WHICH IS WHEN THE DEPLOY WILL RUN IT
--
-- Everything here is invisible to the currently running build. It already
-- composes foundations from the assessment table and deletes the blob's
-- analysis keys before merging, so emptying those keys changes nothing it
-- reads; and it writes the flat columns explicitly rather than relying on the
-- trigger to derive them.
--
-- Dropping the columns is a different matter and lives in 0016, which the
-- deploy tooling deliberately refuses to run unattended.
--
-- REVERSIBILITY
--
-- The full pre-strip blobs are copied to fundraising_foundations_config_pre0015
-- first. Restoring is a single UPDATE ... FROM if anything is found to depend on
-- the removed keys. Drop that table once this has been in production a while.

-- ---------------------------------------------------------------------------
-- 1. Backup
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fundraising_foundations_config_pre0015 AS
SELECT id, config_data, fit_score, priority, research_depth, research_date
  FROM fundraising_foundations;

-- ---------------------------------------------------------------------------
-- 2. Prove nothing is about to lose its only copy.
--
-- A migration that drops a value on the strength of an assumption is how data
-- is lost, so 0012's backfill is checked rather than trusted: every active row
-- carrying analysis in its blob must have an assessment row to carry it
-- instead. A miss aborts the whole migration with both copies intact.
--
-- Note what is deliberately NOT checked: whether the two copies still agree.
-- They should not. Since the write paths moved, an edit updates the assessment
-- and leaves the blob untouched on purpose — so a foundation whose fit score
-- was changed last week has a stale number in its blob and the real one in its
-- assessment. Requiring equality here would abort precisely when the system is
-- working, and passing would only mean nobody had edited anything yet.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  orphaned bigint;
BEGIN
  SELECT count(*) INTO orphaned
    FROM fundraising_foundations f
   WHERE f.archived = false
     AND f.config_data ?| ARRAY['fitScore','priority','themes','tagline','researchNotes']
     AND NOT EXISTS (
       SELECT 1 FROM fundraising_foundation_assessments a
        WHERE a.foundation_id = f.id AND a.org_id = f.org_id
     );

  IF orphaned > 0 THEN
    RAISE EXCEPTION
      'Refusing to strip config_data: % active rows hold analysis in the blob with no assessment row to move it to. Re-run 0012''s backfill first.',
      orphaned;
  END IF;

  RAISE NOTICE 'backfill verified — every active row with blob analysis has an assessment';
END $$;

-- ---------------------------------------------------------------------------
-- 3. Remove the analysis keys from every blob.
--
-- The key list matches ANALYSIS_FIELDS in src/lib/schemas/foundation.ts, which
-- is derived from the Zod schema. `fit` is included as well: it is the
-- pre-fitScore display value, already dead in code, and there is no reason to
-- leave one obsolete scoring key behind while removing eight live ones.
-- ---------------------------------------------------------------------------

UPDATE fundraising_foundations
   SET config_data = config_data
                     - 'fitScore'
                     - 'priority'
                     - 'priorityOverride'
                     - 'themes'
                     - 'tagline'
                     - 'researchNotes'
                     - 'researchDate'
                     - 'researchDepth'
                     - 'possiblePartners'
                     - 'fit'
 WHERE config_data IS NOT NULL
   AND (config_data ?| ARRAY['fitScore','priority','priorityOverride','themes','tagline',
                             'researchNotes','researchDate','researchDepth',
                             'possiblePartners','fit']);

-- ---------------------------------------------------------------------------
-- 4. The trigger keeps only the job it can still do correctly.
--
-- 0003 derived five flat columns from config_data. Four of them are assessment
-- values and are dropped in 0016; `name` is a registry fact and stays. Rewritten
-- rather than dropped so the reason survives next to the code.
--
-- Doing this here, before the columns go, is what makes 0016 safe to run at a
-- time of somebody's choosing: from this point the trigger no longer touches
-- them, so nothing writes to columns that are about to disappear.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION sync_foundation_flat_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- `name` is duplicated for indexed lookups and ordering, and it is a fact
  -- about the foundation, so one shared column is correct for every tenant.
  --
  -- fit_score, priority, research_depth and research_date used to be synced
  -- here too. They were per-organisation values on a table shared by all
  -- organisations, so no single value could be right; they now live in
  -- fundraising_foundation_assessments and are written directly.
  IF NEW.config_data IS NOT NULL THEN
    NEW.name = COALESCE(NEW.config_data->>'name', NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
