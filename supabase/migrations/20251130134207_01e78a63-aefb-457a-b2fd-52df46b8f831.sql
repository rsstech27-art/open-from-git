-- Изменяем тип данных для time_saved_hours с integer на numeric для поддержки десятичных дробей
ALTER TABLE public.metrics 
ALTER COLUMN time_saved_hours TYPE numeric USING time_saved_hours::numeric;