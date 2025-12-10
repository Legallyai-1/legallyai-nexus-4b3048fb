-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Org members can manage appointments" ON appointments;
DROP POLICY IF EXISTS "Org members can view appointments" ON appointments;

-- Create role-based SELECT policy
-- Admin/Owner/Manager can see all, lawyers see their own or case-assigned
CREATE POLICY "Role-based appointment view" ON appointments
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role, organization_id) OR
  has_role(auth.uid(), 'owner'::app_role, organization_id) OR
  has_role(auth.uid(), 'manager'::app_role, organization_id) OR
  lawyer_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM cases
    WHERE cases.id = appointments.case_id
    AND cases.assigned_lawyer_id = auth.uid()
  )
);

-- Create role-based INSERT policy
-- Admin/Owner/Manager can create any, lawyers can create for themselves
CREATE POLICY "Role-based appointment insert" ON appointments
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role, organization_id) OR
  has_role(auth.uid(), 'owner'::app_role, organization_id) OR
  has_role(auth.uid(), 'manager'::app_role, organization_id) OR
  lawyer_id = auth.uid()
);

-- Create role-based UPDATE policy
-- Admin/Owner/Manager can update any, lawyers can update their own
CREATE POLICY "Role-based appointment update" ON appointments
FOR UPDATE USING (
  has_role(auth.uid(), 'admin'::app_role, organization_id) OR
  has_role(auth.uid(), 'owner'::app_role, organization_id) OR
  has_role(auth.uid(), 'manager'::app_role, organization_id) OR
  lawyer_id = auth.uid()
);

-- Create role-based DELETE policy
-- Only Admin/Owner/Manager can delete appointments
CREATE POLICY "Role-based appointment delete" ON appointments
FOR DELETE USING (
  has_role(auth.uid(), 'admin'::app_role, organization_id) OR
  has_role(auth.uid(), 'owner'::app_role, organization_id) OR
  has_role(auth.uid(), 'manager'::app_role, organization_id)
);