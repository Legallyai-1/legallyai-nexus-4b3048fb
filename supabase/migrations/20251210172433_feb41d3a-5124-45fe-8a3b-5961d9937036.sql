-- Drop existing overly permissive policies on cases table
DROP POLICY IF EXISTS "Org members can manage cases" ON cases;
DROP POLICY IF EXISTS "Org members can view cases" ON cases;

-- Create role-based case viewing policy
-- Only admin, owner, manager, and assigned lawyers can view cases
CREATE POLICY "Role-based case view" ON cases
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role, organization_id) OR
  has_role(auth.uid(), 'owner'::app_role, organization_id) OR
  has_role(auth.uid(), 'manager'::app_role, organization_id) OR
  has_role(auth.uid(), 'lawyer'::app_role, organization_id) OR
  assigned_lawyer_id = auth.uid()
);

-- Create role-based case management policy (INSERT, UPDATE, DELETE)
CREATE POLICY "Role-based case management" ON cases
FOR ALL USING (
  has_role(auth.uid(), 'admin'::app_role, organization_id) OR
  has_role(auth.uid(), 'owner'::app_role, organization_id) OR
  has_role(auth.uid(), 'manager'::app_role, organization_id) OR
  assigned_lawyer_id = auth.uid()
);