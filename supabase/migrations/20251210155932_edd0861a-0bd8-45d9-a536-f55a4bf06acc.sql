-- Fix organization creation policy to require authentication
DROP POLICY IF EXISTS "Anyone can create org" ON public.organizations;

CREATE POLICY "Authenticated users can create org"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);