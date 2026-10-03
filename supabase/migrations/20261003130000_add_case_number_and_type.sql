ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS case_number text,
  ADD COLUMN IF NOT EXISTS case_type text;