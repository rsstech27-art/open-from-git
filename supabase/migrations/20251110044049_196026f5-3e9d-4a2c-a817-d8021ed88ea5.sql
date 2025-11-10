-- Add client_name field to clients table
ALTER TABLE public.clients
ADD COLUMN client_name TEXT;