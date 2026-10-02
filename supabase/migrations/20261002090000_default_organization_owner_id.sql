-- create_organization_atomic does not set owner_id; owner_id-based RLS policies need it.
CREATE OR REPLACE FUNCTION public.set_organization_owner_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.owner_id IS NULL THEN
    NEW.owner_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_organization_owner_id ON public.organizations;
CREATE TRIGGER trg_set_organization_owner_id
  BEFORE INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_organization_owner_id();
