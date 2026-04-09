-- Auto-sync flat columns from config_data JSONB (SSOT)
--
-- Problem: 5 flat columns (name, fit_score, priority, research_depth, research_date)
-- duplicate values from config_data JSONB for indexed queries. Every write path had
-- to manually sync both, and we caught 535 mismatches in production (2026-04-08).
--
-- Solution: DB trigger that auto-derives flat columns from config_data on every
-- INSERT or UPDATE. Write paths only need to set config_data; the trigger handles
-- the rest. Zero drift possible.

CREATE OR REPLACE FUNCTION sync_foundation_flat_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync if config_data is present (some rows may have NULL during migration)
  IF NEW.config_data IS NOT NULL THEN
    NEW.name = COALESCE(NEW.config_data->>'name', NEW.name);
    NEW.fit_score = COALESCE((NEW.config_data->>'fitScore')::int, NEW.fit_score);
    NEW.priority = COALESCE((NEW.config_data->>'priority')::int, NEW.priority);
    NEW.research_depth = COALESCE(NEW.config_data->>'researchDepth', NEW.research_depth);
    NEW.research_date = COALESCE(NEW.config_data->>'researchDate', NEW.research_date);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fire on INSERT and on UPDATE when config_data changes
CREATE TRIGGER foundation_flat_sync
BEFORE INSERT OR UPDATE OF config_data ON fundraising_foundations
FOR EACH ROW EXECUTE FUNCTION sync_foundation_flat_columns();
