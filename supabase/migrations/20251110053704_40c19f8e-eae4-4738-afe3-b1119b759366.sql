-- Remove the check constraint on period_type to allow any period format
ALTER TABLE metrics DROP CONSTRAINT IF EXISTS metrics_period_type_check;