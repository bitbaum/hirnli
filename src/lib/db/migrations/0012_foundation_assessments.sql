-- Separate what a foundation IS from what one organisation THINKS of it.
--
-- `fundraising_foundations` has PRIMARY KEY (id) — the slug alone. So the table
-- can hold exactly one row per foundation, for all tenants combined. The
-- `org_id` column suggests otherwise, but it cannot deliver: the moment a
-- second organisation assesses "volkart-stiftung", it collides with the first
-- organisation's row. Today all 16,623 rows are Revamp-IT's, which is why this
-- has never surfaced. It is not a latent inefficiency, it is the reason a
-- second tenant cannot have foundation data at all.
--
-- The fix follows from what the fields mean, and the data says which is which:
--
--   * A foundation's name, purpose, address, deadlines and amounts are facts
--     about the world. They do not change depending on who is reading.
--   * `type` (Schmuki A/B/C/D/network) reads like a relationship but is not:
--     the stored `typeReasoning` describes the foundation ("Potente,
--     professionalisierte Förderstiftung mit professioneller Geschäftsführung"),
--     not the approach. It classifies the organisation being applied to, so it
--     is shared — and 16,623 classifications stop being re-derived per tenant.
--   * `archived` is a record vintage, not a judgement: 1,116 of the 1,117
--     archived rows carry the legacy `fit`/`needsResearch` keys and no
--     unarchived row does. It marks a superseded import batch, so it is shared.
--   * fitScore, priority, themes, tagline and researchNotes are one
--     organisation's opinion. researchNotes says so in its own text —
--     "Relevante Übereinstimmung mit Revamp-IT-Themen (Fit 2/3)". That is both
--     org-specific and confidential: which funders you rate highly, and what
--     you know about them, is not something one tenant shows another.
--
-- So the analysis moves to its own table keyed (org_id, foundation_id), and
-- `fundraising_foundations` becomes the shared registry. A new tenant then
-- inherits 16,623 researched foundations and starts with zero opinions about
-- them, which is exactly the correct starting state.
--
-- This migration is additive: it creates and fills the table. Nothing reads it
-- yet, and the same values remain in `config_data`. The duplication is
-- deliberate and temporary — readers move over next, and only then are the
-- fields removed from the blob. Splitting it that way means no single step both
-- changes where the data lives and changes what the app reads.
--
-- Note what the columns are NOT. In `fundraising_foundations`, fit_score /
-- priority / research_date / research_depth exist twice: once inside
-- `config_data` and once as flat columns, kept honest by the trigger added in
-- 0003 after 535 rows had drifted apart in production. Here each value is a
-- column and nothing else. There is nothing to sync because there is nothing to
-- sync with.

CREATE TABLE IF NOT EXISTS fundraising_foundation_assessments (
  org_id            text        NOT NULL,
  foundation_id     text        NOT NULL,

  -- Scoring. Both are NOT NULL because the data says they always exist:
  -- fitScore is an integer 0-10 on all 16,623 rows, priority 1-4 on all of
  -- them. A nullable column would invite a reader to invent a default.
  fit_score         integer     NOT NULL DEFAULT 0,
  priority          integer     NOT NULL DEFAULT 4,

  -- True means the stored priority wins over the computed one. Currently NULL
  -- on every row — it has never been written, though the scoring code branches
  -- on it. Kept (the branch is real and cheap) but defaulted honestly to false
  -- rather than carrying a NULL that means "nobody ever said".
  priority_override boolean     NOT NULL DEFAULT false,

  -- Which of THIS organisation's themes the foundation matches. The values are
  -- Revamp-IT's seven mission areas, which is the point: the vocabulary itself
  -- belongs to a tenant, so it is stored, not constrained to a code enum.
  themes            jsonb       NOT NULL DEFAULT '[]'::jsonb,

  tagline           text,
  research_notes    text,

  -- When THIS organisation last assessed the foundation, and how deeply. The
  -- registry's own freshness is `fundraising_foundations.updated_at`.
  research_date     text,
  research_depth    text,

  possible_partners jsonb,

  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Constraints are added separately and guarded, so re-running this file against
-- a database that already has it is a no-op rather than an error. Postgres has
-- no ADD CONSTRAINT IF NOT EXISTS, and a migration that only works once is a
-- migration nobody can safely retry after a partial deploy.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fundraising_foundation_assessments_pkey') THEN
    ALTER TABLE fundraising_foundation_assessments
      ADD CONSTRAINT fundraising_foundation_assessments_pkey PRIMARY KEY (org_id, foundation_id);
  END IF;
END $$;

-- The pair of foreign keys is what makes the table structurally per-tenant:
-- one row per (organisation, foundation), and deleting either parent takes its
-- assessments with it.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fund_assessments_org_fk') THEN
    ALTER TABLE fundraising_foundation_assessments
      ADD CONSTRAINT fund_assessments_org_fk
      FOREIGN KEY (org_id) REFERENCES org_profiles(org_id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fund_assessments_foundation_fk') THEN
    ALTER TABLE fundraising_foundation_assessments
      ADD CONSTRAINT fund_assessments_foundation_fk
      FOREIGN KEY (foundation_id) REFERENCES fundraising_foundations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ranges verified against all 16,623 live rows before being asserted here.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fund_assessments_fit_score_range') THEN
    ALTER TABLE fundraising_foundation_assessments
      ADD CONSTRAINT fund_assessments_fit_score_range CHECK (fit_score BETWEEN 0 AND 10);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fund_assessments_priority_range') THEN
    ALTER TABLE fundraising_foundation_assessments
      ADD CONSTRAINT fund_assessments_priority_range CHECK (priority BETWEEN 1 AND 4);
  END IF;
END $$;

-- `themes` is queried with containment operators, so it must actually be an
-- array. A JSONB column will hold a string or a number just as happily.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fund_assessments_themes_is_array') THEN
    ALTER TABLE fundraising_foundation_assessments
      ADD CONSTRAINT fund_assessments_themes_is_array CHECK (jsonb_typeof(themes) = 'array');
  END IF;
END $$;

-- The list view sorts one organisation's foundations by priority then fit.
CREATE INDEX IF NOT EXISTS fund_assessments_org_rank_idx
  ON fundraising_foundation_assessments (org_id, priority, fit_score DESC);

-- Theme filtering ("show me everything matching digitale-bildung").
CREATE INDEX IF NOT EXISTS fund_assessments_themes_idx
  ON fundraising_foundation_assessments USING gin (themes);

-- Backfill from the blob. ON CONFLICT DO NOTHING so a re-run neither duplicates
-- nor overwrites: if a row is already here it may have been edited since, and a
-- migration must not silently revert somebody's work back to the blob's value.
INSERT INTO fundraising_foundation_assessments (
  org_id, foundation_id, fit_score, priority, priority_override,
  themes, tagline, research_notes, research_date, research_depth, possible_partners
)
SELECT
  f.org_id,
  f.id,
  COALESCE((f.config_data->>'fitScore')::int, 0),
  COALESCE((f.config_data->>'priority')::int, 4),
  COALESCE((f.config_data->>'priorityOverride')::boolean, false),
  COALESCE(f.config_data->'themes', '[]'::jsonb),
  f.config_data->>'tagline',
  f.config_data->>'researchNotes',
  f.config_data->>'researchDate',
  f.config_data->>'researchDepth',
  f.config_data->'possiblePartners'
FROM fundraising_foundations f
WHERE f.org_id IS NOT NULL
  AND f.config_data IS NOT NULL
ON CONFLICT (org_id, foundation_id) DO NOTHING;
