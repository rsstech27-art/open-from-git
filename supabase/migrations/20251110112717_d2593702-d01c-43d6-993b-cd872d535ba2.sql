-- Add ai_status column to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS ai_status TEXT DEFAULT 'active' CHECK (ai_status IN ('active', 'paused', 'inactive'));