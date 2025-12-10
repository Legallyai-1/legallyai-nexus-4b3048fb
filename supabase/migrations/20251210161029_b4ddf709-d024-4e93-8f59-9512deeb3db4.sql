-- Fix 1: Restrict client PII access to case-assigned lawyers only
DROP POLICY IF EXISTS "Privileged users can view clients" ON public.clients;

CREATE POLICY "Lawyers can view clients for their cases"
  ON public.clients FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role, organization_id) OR
    has_role(auth.uid(), 'owner'::app_role, organization_id) OR
    has_role(auth.uid(), 'manager'::app_role, organization_id) OR
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.client_id = clients.id
      AND cases.assigned_lawyer_id = auth.uid()
    )
  );

-- Fix 2: Split case_documents ALL policy into granular policies
DROP POLICY IF EXISTS "Can manage docs for accessible cases" ON public.case_documents;

CREATE POLICY "Can add docs for accessible cases"
  ON public.case_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = case_documents.case_id 
      AND is_org_member(auth.uid(), cases.organization_id))
  );

CREATE POLICY "Can update docs for accessible cases"
  ON public.case_documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = case_documents.case_id 
      AND is_org_member(auth.uid(), cases.organization_id))
  );

CREATE POLICY "Can delete own or admin docs"
  ON public.case_documents FOR DELETE
  TO authenticated
  USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM cases c 
      WHERE c.id = case_documents.case_id 
      AND (has_role(auth.uid(), 'admin'::app_role, c.organization_id) 
        OR has_role(auth.uid(), 'owner'::app_role, c.organization_id))
    )
  );