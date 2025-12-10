-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can view own time entries" ON time_entries;

-- SELECT: Users see own, Admin/Owner/Manager see all in org
CREATE POLICY "Role-based time entry view" ON time_entries
FOR SELECT USING (
  user_id = auth.uid() OR
  has_role(auth.uid(), 'admin'::app_role, organization_id) OR
  has_role(auth.uid(), 'owner'::app_role, organization_id) OR
  has_role(auth.uid(), 'manager'::app_role, organization_id)
);

-- INSERT: Users can only insert their own entries
CREATE POLICY "Users insert own time entries" ON time_entries
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  is_org_member(auth.uid(), organization_id)
);

-- UPDATE: Users update own, Admin/Owner can update any
CREATE POLICY "Role-based time entry update" ON time_entries
FOR UPDATE USING (
  user_id = auth.uid() OR
  has_role(auth.uid(), 'admin'::app_role, organization_id) OR
  has_role(auth.uid(), 'owner'::app_role, organization_id)
);

-- DELETE: Users delete own, Admin/Owner can delete any
CREATE POLICY "Role-based time entry delete" ON time_entries
FOR DELETE USING (
  user_id = auth.uid() OR
  has_role(auth.uid(), 'admin'::app_role, organization_id) OR
  has_role(auth.uid(), 'owner'::app_role, organization_id)
);