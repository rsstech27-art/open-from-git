-- Add email field to clients table
ALTER TABLE public.clients
ADD COLUMN email TEXT UNIQUE;