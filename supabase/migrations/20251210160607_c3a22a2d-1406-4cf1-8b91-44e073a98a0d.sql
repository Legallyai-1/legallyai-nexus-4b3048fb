-- Fix client PII access - restrict to assigned lawyers and privileged roles
DROP POLICY IF EXISTS "Org members can view clients" ON public.clients;
DROP POLICY IF EXISTS "Org members can manage clients" ON public.clients;

-- Create more restrictive SELECT policy
CREATE POLICY "Privileged users can view clients"
  ON public.clients FOR SELECT
  USING (
    -- Assigned lawyers can see clients on their cases
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.client_id = clients.id
      AND cases.assigned_lawyer_id = auth.uid()
    )
    -- Admins, owners, managers, and lawyers can see all org clients
    OR has_role(auth.uid(), 'admin'::app_role, organization_id)
    OR has_role(auth.uid(), 'owner'::app_role, organization_id)
    OR has_role(auth.uid(), 'manager'::app_role, organization_id)
    OR has_role(auth.uid(), 'lawyer'::app_role, organization_id)
  );

-- Create more restrictive management policy
CREATE POLICY "Privileged users can manage clients"
  ON public.clients FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role, organization_id)
    OR has_role(auth.uid(), 'owner'::app_role, organization_id)
    OR has_role(auth.uid(), 'manager'::app_role, organization_id)
    OR has_role(auth.uid(), 'lawyer'::app_role, organization_id)
  );