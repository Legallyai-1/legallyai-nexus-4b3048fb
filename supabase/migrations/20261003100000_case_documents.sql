CREATE TABLE IF NOT EXISTS public.case_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  file_url text,
  file_type text,
  file_size integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_case_documents_case_id ON public.case_documents(case_id);

ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Case owners manage case documents" ON public.case_documents;
CREATE POLICY "Case owners manage case documents"
  ON public.case_documents FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_documents.case_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_documents.case_id AND c.user_id = auth.uid()));
