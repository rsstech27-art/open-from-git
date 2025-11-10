-- Remove old metrics and add new ones
ALTER TABLE public.metrics 
  DROP COLUMN financial_equiv,
  DROP COLUMN retention_share,
  ADD COLUMN time_saved_hours INTEGER DEFAULT 0,
  ADD COLUMN confirmed_appointments INTEGER DEFAULT 0;