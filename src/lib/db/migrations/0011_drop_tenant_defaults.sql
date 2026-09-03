-- Remove the column defaults that silently attribute rows to the first tenant.
--
-- Every tenant-scoped column carried DEFAULT 'revamp-it'. With one customer
-- that is invisible; with two it means any insert that forgets to say whose
-- data it is files the row under Revamp-IT, and afterwards nothing
-- distinguishes it. The attribution is not wrong in a recoverable way — it is
-- gone.
--
-- "Whose data is this?" has no sensible fallback, so an unanswered question
-- must stop the write rather than be answered on the writer's behalf. Removing
-- the defaults makes the database enforce that: a NOT NULL column with no
-- default rejects the row.
--
-- The corresponding code change removed the same default from the Drizzle
-- schema, and TypeScript immediately found five write paths that had never
-- said whose data they were creating — including three activity-log writes.
-- Those were not hypothetical: they would have logged evig's actions as
-- Revamp-IT's.
--
-- Existing rows are untouched. Every one already carries 'revamp-it', which is
-- correct — they ARE Revamp-IT's.

ALTER TABLE fundraising_foundations        ALTER COLUMN org_id DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE fundraising_applications       ALTER COLUMN org_id DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE fundraising_customization_rules ALTER COLUMN org_id DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE fundraising_activity_log       ALTER COLUMN org_id DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE fundraising_gesuch_overrides   ALTER COLUMN org_id DROP DEFAULT;
