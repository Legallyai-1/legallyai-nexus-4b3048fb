-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Can view docs for accessible cases" ON case_documents;
DROP POLICY IF EXISTS "Can add docs for accessible cases" ON case_documents;
DROP POLICY IF EXISTS "Can update docs for accessible cases" ON case_documents;

-- Create role-based SELECT policy aligned with cases access
CREATE POLICY "Role-based document view" ON case_documents
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM cases
    WHERE cases.id = case_documents.case_id
    AND (
      has_role(auth.uid(), 'admin'::app_role, cases.organization_id) OR
      has_role(auth.uid(), 'owner'::app_role, cases.organization_id) OR
      has_role(auth.uid(), 'manager'::app_role, cases.organization_id) OR
      has_role(auth.uid(), 'lawyer'::app_role, cases.organization_id) OR
      cases.assigned_lawyer_id = auth.uid()
    )
  )
);

-- Create role-based INSERT policy - only privileged roles and assigned lawyers
CREATE POLICY "Role-based document insert" ON case_documents
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM cases
    WHERE cases.id = case_documents.case_id
    AND (
      has_role(auth.uid(), 'admin'::app_role, cases.organization_id) OR
      has_role(auth.uid(), 'owner'::app_role, cases.organization_id) OR
      has_role(auth.uid(), 'manager'::app_role, cases.organization_id) OR
      cases.assigned_lawyer_id = auth.uid()
    )
  )
);

-- Create role-based UPDATE policy - uploader or privileged roles
CREATE POLICY "Role-based document update" ON case_documents
FOR UPDATE USING (
  uploaded_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM cases
    WHERE cases.id = case_documents.case_id
    AND (
      has_role(auth.uid(), 'admin'::app_role, cases.organization_id) OR
      has_role(auth.uid(), 'owner'::app_role, cases.organization_id) OR
      has_role(auth.uid(), 'manager'::app_role, cases.organization_id)
    )
  )
);