-- Hot-path indexes for query patterns that scan the foundations + applications
-- + activity_log tables on every page load. The tables aren't huge yet (16k
-- rows in foundations, single-digit in the rest), but every query that
-- currently does a seq scan becomes O(1) once they're in place — and the cost
-- of adding them now is trivial compared to backfilling them under load.
--
-- All five indexes are non-unique and concurrent-safe (no DDL locks beyond
-- the brief catalog write), so this migration can apply against a live DB.

-- Foundations: sync + audit scripts filter by (org_id, archived) on every
-- run and the audit also slices by priority and data_confidence.
CREATE INDEX IF NOT EXISTS "fund_foundations_org_archived_idx"
  ON "fundraising_foundations" ("org_id", "archived");

CREATE INDEX IF NOT EXISTS "fund_foundations_priority_idx"
  ON "fundraising_foundations" ("priority");

CREATE INDEX IF NOT EXISTS "fund_foundations_data_confidence_idx"
  ON "fundraising_foundations" ("data_confidence");

-- Applications: Kanban + dashboard filter by status; AddToPipelineButton +
-- findActiveApplication look up by foundation_id.
CREATE INDEX IF NOT EXISTS "fund_applications_foundation_idx"
  ON "fundraising_applications" ("foundation_id");

CREATE INDEX IF NOT EXISTS "fund_applications_status_idx"
  ON "fundraising_applications" ("status");

-- ActivityLog: OverrideHistory + ActivityTimeline filter by
-- (entity_type, entity_id) and order by timestamp DESC. Composite covers
-- both the WHERE and the ORDER BY in a single index walk.
CREATE INDEX IF NOT EXISTS "fund_activity_log_entity_idx"
  ON "fundraising_activity_log" ("entity_type", "entity_id", "timestamp");
