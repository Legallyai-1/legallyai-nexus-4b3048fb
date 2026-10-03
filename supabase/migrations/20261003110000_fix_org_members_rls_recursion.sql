-- org_members_select referenced org_members itself (infinite RLS recursion); use a definer helper instead.
CREATE OR REPLACE FUNCTION public.is_org_member_uid(_org uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.org_members WHERE org_id = _org AND user_id = auth.uid());
$$;

REVOKE EXECUTE ON FUNCTION public.is_org_member_uid(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_org_member_uid(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS org_members_select ON public.org_members;
CREATE POLICY org_members_select ON public.org_members FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_org_member_uid(org_id));

CREATE OR REPLACE FUNCTION public.create_organization_atomic(p_name text, p_slug text, p_description text DEFAULT NULL::text, p_address text DEFAULT NULL::text, p_city text DEFAULT NULL::text, p_state text DEFAULT NULL::text, p_zip_code text DEFAULT NULL::text, p_phone text DEFAULT NULL::text, p_email text DEFAULT NULL::text, p_website text DEFAULT NULL::text)
 RETURNS organizations
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_slug text := lower(trim(COALESCE(p_slug, '')));
  v_org public.organizations%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF length(trim(COALESCE(p_name, ''))) < 3 THEN
    RAISE EXCEPTION 'Organization name must be at least 3 characters';
  END IF;

  IF v_slug = '' THEN
    RAISE EXCEPTION 'Organization slug is required';
  END IF;

  IF v_slug !~ '^[a-z0-9-]+$' THEN
    RAISE EXCEPTION 'Organization slug must contain only lowercase letters, numbers, and hyphens';
  END IF;

  INSERT INTO public.organizations (
    name,
    slug,
    description,
    address,
    city,
    state,
    zip_code,
    phone,
    email,
    website
  )
  VALUES (
    trim(p_name),
    v_slug,
    NULLIF(trim(COALESCE(p_description, '')), ''),
    NULLIF(trim(COALESCE(p_address, '')), ''),
    NULLIF(trim(COALESCE(p_city, '')), ''),
    NULLIF(trim(COALESCE(p_state, '')), ''),
    NULLIF(trim(COALESCE(p_zip_code, '')), ''),
    NULLIF(trim(COALESCE(p_phone, '')), ''),
    NULLIF(trim(COALESCE(p_email, '')), ''),
    NULLIF(trim(COALESCE(p_website, '')), '')
  )
  RETURNING * INTO v_org;

  INSERT INTO public.org_members (org_id, user_id, role)
  VALUES (v_org.id, v_user_id, 'owner')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.organization_members (organization_id, user_id, job_title, department)
  VALUES (v_org.id, v_user_id, 'Owner', 'Management');

  DELETE FROM public.user_roles
  WHERE user_id = v_user_id
    AND organization_id = v_org.id;

  INSERT INTO public.user_roles (user_id, organization_id, role)
  VALUES (v_user_id, v_org.id, 'owner'::public.app_role);

  INSERT INTO public.audit_logs (
    org_id,
    actor_user_id,
    action,
    target_type,
    target_id,
    metadata
  )
  VALUES (
    v_org.id,
    v_user_id,
    'organization.created',
    'organization',
    v_org.id::text,
    jsonb_build_object('name', v_org.name, 'slug', v_org.slug)
  );

  RETURN v_org;
EXCEPTION
  WHEN unique_violation THEN
    IF strpos(SQLERRM, 'organizations_slug_key') > 0 THEN
      RAISE EXCEPTION USING
        ERRCODE = '23505',
        MESSAGE = 'Organization slug already exists';
    END IF;
    RAISE;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.create_organization_atomic(text, text, text, text, text, text, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_organization_atomic(text, text, text, text, text, text, text, text, text, text) TO authenticated, service_role;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_id_auth_users_fkey') THEN
    DELETE FROM public.profiles p WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id);
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_id_auth_users_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END
$$;
