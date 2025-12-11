-- Create cases_imported table for CourtListener case storage
CREATE TABLE IF NOT EXISTS public.cases_imported (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'courtlistener',
  courtlistener_id INTEGER UNIQUE,
  title TEXT,
  date_filed DATE,
  citation TEXT,
  url TEXT,
  raw JSONB,
  summary TEXT,
  defense_plan TEXT,
  client_summary TEXT,
  custody_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cases_imported ENABLE ROW LEVEL SECURITY;

-- Public read access for case research
CREATE POLICY "Anyone can view imported cases"
ON public.cases_imported
FOR SELECT
USING (true);

-- Service role can manage all records (for edge functions)
CREATE POLICY "Service role can manage cases"
ON public.cases_imported
FOR ALL
USING (true)
WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER update_cases_imported_updated_at
BEFORE UPDATE ON public.cases_imported
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();