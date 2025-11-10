-- Add satisfaction field to metrics table
ALTER TABLE public.metrics
ADD COLUMN satisfaction DECIMAL(5,4) DEFAULT 0.0000;