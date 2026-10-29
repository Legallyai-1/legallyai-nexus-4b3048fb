-- NOT APPLIED. For Dakota to review and run in the Supabase SQL editor (project whdljtbtqisoszbrzdwq).
-- Hardening: the existing "Users manage own time entries" policy only checks user_id, so a signed-in
-- user could write a time entry tagged with another firm's organization_id (or case_id). This keeps
-- own-row access but requires the user to be a member of the organization they log time against,
-- and the case (if any) to belong to that organization.
BEGIN;

DROP POLICY IF EXISTS "Users manage own time entries" ON public.time_entries;
CREATE POLICY "Users manage own time entries"
  ON public.time_entries FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_org_member(auth.uid(), organization_id)
    AND (
      case_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.cases c
        WHERE c.id = case_id AND c.organization_id = time_entries.organization_id
      )
    )
  );

COMMIT;
