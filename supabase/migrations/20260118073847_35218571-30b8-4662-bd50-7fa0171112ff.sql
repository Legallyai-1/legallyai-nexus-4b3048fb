-- Fix 1: Admin certification management - restrict to admin/owner roles only
DROP POLICY IF EXISTS "Admins can manage certifications" ON public.micro_certifications;
CREATE POLICY "Admins can manage certifications" ON public.micro_certifications FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- Fix 2: Bug reports - restrict to own reports only (admins have separate policy)
DROP POLICY IF EXISTS "Users can view own bug reports" ON public.bug_reports;
CREATE POLICY "Users can view own bug reports" ON public.bug_reports FOR SELECT 
USING (user_id = auth.uid());