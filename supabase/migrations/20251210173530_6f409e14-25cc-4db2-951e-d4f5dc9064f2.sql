-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Privileged users can manage clients" ON clients;

-- Create policy for full management (INSERT, UPDATE, DELETE) by admin/owner/manager only
CREATE POLICY "Admin roles can manage clients" ON clients
FOR ALL USING (
  has_role(auth.uid(), 'admin'::app_role, organization_id) OR
  has_role(auth.uid(), 'owner'::app_role, organization_id) OR
  has_role(auth.uid(), 'manager'::app_role, organization_id)
);

-- Create separate UPDATE policy for lawyers - only for their assigned clients
CREATE POLICY "Lawyers can update assigned clients" ON clients
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM cases
    WHERE cases.client_id = clients.id
    AND cases.assigned_lawyer_id = auth.uid()
    AND cases.organization_id = clients.organization_id
  )
);