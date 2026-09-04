-- Drop the flat assessment columns from the shared registry table.
--
-- The contract half of the expand/contract begun in 0015. fit_score, priority,
-- research_depth and research_date describe what ONE organisation makes of a
-- foundation, while fundraising_foundations holds one row per foundation for
-- every tenant together — so no single value in these columns could be correct
-- once there was more than one customer. They live in
-- fundraising_foundation_assessments, keyed (org_id, foundation_id).
--
-- RUN THIS BY HAND, AFTER THE CODE THAT STOPS READING THEM IS LIVE
--
-- The deploy tooling refuses to apply a DROP COLUMN unattended, and it is right
-- to: this is not reversible by re-running anything, and the tooling applies
-- schema BEFORE it ships the new build. Running it automatically would drop the
-- columns out from under the build still serving traffic — which names every
-- column explicitly in its SELECTs, so every foundation read would fail for the
-- length of the deploy.
--
--   1. Let the deploy ship the code (0015 applies on its own; this file is
--      skipped with a refusal, which is the intended outcome).
--   2. Confirm the new build is serving.
--   3. Run this file.
--   4. Record it so the next deploy stops refusing:
--
--        INSERT INTO public._deploy_schema_history (tag)
--        VALUES ('0016_drop_flat_assessment_columns')
--        ON CONFLICT DO NOTHING;
--
-- The values are not lost by this: 0012 copied them into the assessments table,
-- and 0015 verified that every active row carrying analysis has an assessment
-- row before removing anything. 0015 also left a full copy in
-- fundraising_foundations_config_pre0015, including these four columns.

ALTER TABLE fundraising_foundations
  DROP COLUMN IF EXISTS fit_score,
  DROP COLUMN IF EXISTS priority,
  DROP COLUMN IF EXISTS research_depth,
  DROP COLUMN IF EXISTS research_date;
