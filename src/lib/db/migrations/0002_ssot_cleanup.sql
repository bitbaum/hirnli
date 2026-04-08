-- SSOT Cleanup: Drop orphan columns and dead tables
--
-- These columns exist in the DB from migration 0000 but are NOT in the
-- current Drizzle schema. All foundation data lives in config_data JSONB.
-- The flat columns caused confusion (scripts writing to contact_email while
-- app reads from config_data->'contact'->>'email').
--
-- Keeping only: id, name, fit_score, priority, research_depth, research_date,
--               data_confidence, config_data, org_id, source, created_at,
--               updated_at, archived

-- Drop orphan columns from fundraising_foundations
ALTER TABLE fundraising_foundations DROP COLUMN IF EXISTS website_url;
ALTER TABLE fundraising_foundations DROP COLUMN IF EXISTS contact_email;
ALTER TABLE fundraising_foundations DROP COLUMN IF EXISTS contact_phone;
ALTER TABLE fundraising_foundations DROP COLUMN IF EXISTS contact_address;
ALTER TABLE fundraising_foundations DROP COLUMN IF EXISTS focus_areas;
ALTER TABLE fundraising_foundations DROP COLUMN IF EXISTS geographic_scope;
ALTER TABLE fundraising_foundations DROP COLUMN IF EXISTS organization_type;
ALTER TABLE fundraising_foundations DROP COLUMN IF EXISTS grant_range_min;
ALTER TABLE fundraising_foundations DROP COLUMN IF EXISTS grant_range_max;
ALTER TABLE fundraising_foundations DROP COLUMN IF EXISTS typical_amount;
ALTER TABLE fundraising_foundations DROP COLUMN IF EXISTS funding_model;
ALTER TABLE fundraising_foundations DROP COLUMN IF EXISTS application_method;
ALTER TABLE fundraising_foundations DROP COLUMN IF EXISTS application_deadline;
ALTER TABLE fundraising_foundations DROP COLUMN IF EXISTS decision_timeline;
ALTER TABLE fundraising_foundations DROP COLUMN IF EXISTS strategic_fit;
ALTER TABLE fundraising_foundations DROP COLUMN IF EXISTS application_notes;
ALTER TABLE fundraising_foundations DROP COLUMN IF EXISTS past_grantees;
ALTER TABLE fundraising_foundations DROP COLUMN IF EXISTS board_members;
ALTER TABLE fundraising_foundations DROP COLUMN IF EXISTS data_quality;
ALTER TABLE fundraising_foundations DROP COLUMN IF EXISTS research_file_path;
ALTER TABLE fundraising_foundations DROP COLUMN IF EXISTS verified_at;
ALTER TABLE fundraising_foundations DROP COLUMN IF EXISTS verified_by;
ALTER TABLE fundraising_foundations DROP COLUMN IF EXISTS website_url;

-- Drop dead tables (never read by app)
DROP TABLE IF EXISTS fundraising_foundation_registry CASCADE;
DROP TABLE IF EXISTS fundraising_contacts CASCADE;
