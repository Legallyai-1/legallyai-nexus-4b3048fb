-- Complete the remaining security policies that didn't get created

-- Drop and recreate the organization insert policy with correct name
DROP POLICY IF EXISTS "Authenticated users can create org" ON public.organizations;
CREATE POLICY "Auth users can create org" ON public.organizations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Add remaining policies for integration_logs if they don't exist
DROP POLICY IF EXISTS "No delete on integration logs" ON public.integration_logs;
CREATE POLICY "No delete on integration logs" ON public.integration_logs FOR DELETE
USING (false);

DROP POLICY IF EXISTS "No update on integration logs" ON public.integration_logs;
CREATE POLICY "No update on integration logs" ON public.integration_logs FOR UPDATE
USING (false);