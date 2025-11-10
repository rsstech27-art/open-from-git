-- Drop the old unique constraint
ALTER TABLE public.metrics DROP CONSTRAINT IF EXISTS metrics_client_id_date_key;

-- Add new unique constraint on client_id and period_type
ALTER TABLE public.metrics ADD CONSTRAINT metrics_client_id_period_key UNIQUE (client_id, period_type);