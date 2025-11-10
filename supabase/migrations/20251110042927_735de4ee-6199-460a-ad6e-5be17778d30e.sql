-- Create managers table
CREATE TABLE public.managers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.managers ENABLE ROW LEVEL SECURITY;

-- Create policies for managers table
CREATE POLICY "Admins can view all managers"
ON public.managers
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert managers"
ON public.managers
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update managers"
ON public.managers
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete managers"
ON public.managers
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_managers_updated_at
BEFORE UPDATE ON public.managers
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert some default managers
INSERT INTO public.managers (name, email, phone) VALUES
  ('Алексей Петров', 'petrov@example.com', '+79991234567'),
  ('Мария Иванова', 'ivanova@example.com', '+79991234568'),
  ('Дмитрий Сидоров', 'sidorov@example.com', '+79991234569');