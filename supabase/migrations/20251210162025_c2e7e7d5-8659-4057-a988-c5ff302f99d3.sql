-- Fix: Tighten client access - lawyers can only view clients for cases they're actively assigned to
-- Drop existing policy
DROP POLICY IF EXISTS "Lawyers can view clients for their cases" ON public.clients;

-- Create more restrictive policy - only view client when accessing through an assigned case context
CREATE POLICY "Assigned lawyers and privileged roles can view clients"
  ON public.clients FOR SELECT
  TO authenticated
  USING (
    -- Privileged roles can view all clients in their organization
    has_role(auth.uid(), 'admin'::app_role, organization_id) OR
    has_role(auth.uid(), 'owner'::app_role, organization_id) OR
    has_role(auth.uid(), 'manager'::app_role, organization_id) OR
    -- Lawyers can only view clients for cases they are directly assigned to
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.client_id = clients.id
      AND cases.assigned_lawyer_id = auth.uid()
      AND cases.organization_id = clients.organization_id
    )
  );

-- Restrict invoices to privileged roles and assigned lawyers only
DROP POLICY IF EXISTS "Org members can view invoices" ON public.invoices;

CREATE POLICY "Privileged roles and assigned lawyers can view invoices"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role, organization_id) OR
    has_role(auth.uid(), 'owner'::app_role, organization_id) OR
    has_role(auth.uid(), 'manager'::app_role, organization_id) OR
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = invoices.case_id
      AND cases.assigned_lawyer_id = auth.uid()
    )
  );

-- Restrict hourly_rate visibility - create a view for safe member data
-- Note: For now, we'll leave the policy but this is a known limitation