-- Add new columns for business hours appointments and response speed
ALTER TABLE public.metrics 
ADD COLUMN business_hours_appointments INTEGER DEFAULT 0,
ADD COLUMN non_business_hours_appointments INTEGER DEFAULT 0,
ADD COLUMN avg_response_speed_seconds INTEGER DEFAULT 0;