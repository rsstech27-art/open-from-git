-- Добавляем новые колонки для новых и повторных клиентов
ALTER TABLE public.metrics 
ADD COLUMN IF NOT EXISTS new_clients integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS returning_clients integer DEFAULT 0;