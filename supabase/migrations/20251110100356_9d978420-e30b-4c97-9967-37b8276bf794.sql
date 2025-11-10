-- Remove average response speed and add dialog duration categories
ALTER TABLE public.metrics 
DROP COLUMN avg_response_speed_seconds,
ADD COLUMN short_dialogs INTEGER DEFAULT 0,
ADD COLUMN medium_dialogs INTEGER DEFAULT 0,
ADD COLUMN long_dialogs INTEGER DEFAULT 0;