ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS slug text;

UPDATE public.organizations
SET slug = CONCAT(
  COALESCE(
    NULLIF(TRIM(BOTH '-' FROM regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g')), ''),
    'org'
  ),
  '-',
  substr(id::text, 1, 8)
)
WHERE slug IS NULL OR slug = '';

ALTER TABLE public.organizations
ALTER COLUMN slug SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'organizations_slug_key'
      AND conrelid = 'public.organizations'::regclass
  ) THEN
    ALTER TABLE public.organizations
      ADD CONSTRAINT organizations_slug_key UNIQUE (slug);
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_org_created_at_idx
  ON public.audit_logs (org_id, created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.organization_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.app_role NOT NULL,
  token_hash text NOT NULL UNIQUE,
  invited_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS organization_invites_org_id_idx
  ON public.organization_invites (organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS organization_invites_email_idx
  ON public.organization_invites (lower(email));

ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_org_role(
  check_user_id uuid,
  check_org_id uuid,
  check_roles public.app_role[]
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = check_user_id
      AND organization_id = check_org_id
      AND role = ANY(check_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.count_org_owners(check_org_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM public.user_roles
  WHERE organization_id = check_org_id
    AND role = 'owner'::public.app_role;
$$;

CREATE OR REPLACE FUNCTION public.create_organization_atomic(
  p_name text,
  p_slug text,
  p_description text DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_state text DEFAULT NULL,
  p_zip_code text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_website text DEFAULT NULL
)
RETURNS public.organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.set_org_member_role(
  p_org_id uuid,
  p_target_user_id uuid,
  p_new_role public.app_role
)
RETURNS public.user_roles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_user_id uuid := auth.uid();
  v_actor_is_owner boolean;
  v_actor_can_manage boolean;
  v_old_role public.app_role;
  v_result public.user_roles%ROWTYPE;
BEGIN
  IF v_actor_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_org_id IS NULL OR p_target_user_id IS NULL THEN
    RAISE EXCEPTION 'Organization and target user are required';
  END IF;

  v_actor_is_owner := public.has_org_role(v_actor_user_id, p_org_id, ARRAY['owner'::public.app_role]);
  v_actor_can_manage := v_actor_is_owner
    OR public.has_org_role(v_actor_user_id, p_org_id, ARRAY['admin'::public.app_role]);

  IF NOT v_actor_can_manage THEN
    RAISE EXCEPTION 'Only organization owners or admins can manage member roles';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id = p_org_id
      AND user_id = p_target_user_id
      AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Target user is not an active organization member';
  END IF;

  SELECT role
  INTO v_old_role
  FROM public.user_roles
  WHERE user_id = p_target_user_id
    AND organization_id = p_org_id
  ORDER BY CASE role
    WHEN 'owner'::public.app_role THEN 1
    WHEN 'admin'::public.app_role THEN 2
    ELSE 3
  END
  LIMIT 1;

  IF NOT v_actor_is_owner
     AND (p_new_role = 'owner'::public.app_role OR v_old_role = 'owner'::public.app_role) THEN
    RAISE EXCEPTION 'Only organization owners can manage owner roles';
  END IF;

  IF v_old_role = 'owner'::public.app_role
     AND p_new_role <> 'owner'::public.app_role
  THEN
    PERFORM 1
    FROM public.user_roles
    WHERE organization_id = p_org_id
      AND role = 'owner'::public.app_role
    FOR UPDATE;

    IF public.count_org_owners(p_org_id) <= 1 THEN
      RAISE EXCEPTION 'Organization must retain at least one owner';
    END IF;
  END IF;

  DELETE FROM public.user_roles
  WHERE user_id = p_target_user_id
    AND organization_id = p_org_id;

  INSERT INTO public.user_roles (user_id, organization_id, role)
  VALUES (p_target_user_id, p_org_id, p_new_role)
  RETURNING * INTO v_result;

  INSERT INTO public.audit_logs (
    org_id,
    actor_user_id,
    action,
    target_type,
    target_id,
    metadata
  )
  VALUES (
    p_org_id,
    v_actor_user_id,
    'organization.member_role_changed',
    'organization_member',
    p_target_user_id::text,
    jsonb_build_object(
      'old_role', v_old_role,
      'new_role', p_new_role
    )
  );

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_org_member(
  p_org_id uuid,
  p_target_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_user_id uuid := auth.uid();
  v_actor_is_owner boolean;
  v_actor_can_manage boolean;
  v_target_role public.app_role;
BEGIN
  IF v_actor_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_org_id IS NULL OR p_target_user_id IS NULL THEN
    RAISE EXCEPTION 'Organization and target user are required';
  END IF;

  v_actor_is_owner := public.has_org_role(v_actor_user_id, p_org_id, ARRAY['owner'::public.app_role]);
  v_actor_can_manage := v_actor_is_owner
    OR public.has_org_role(v_actor_user_id, p_org_id, ARRAY['admin'::public.app_role]);

  IF NOT v_actor_can_manage THEN
    RAISE EXCEPTION 'Only organization owners or admins can remove members';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id = p_org_id
      AND user_id = p_target_user_id
  ) THEN
    RAISE EXCEPTION 'Target user is not an organization member';
  END IF;

  SELECT role
  INTO v_target_role
  FROM public.user_roles
  WHERE user_id = p_target_user_id
    AND organization_id = p_org_id
  ORDER BY CASE role
    WHEN 'owner'::public.app_role THEN 1
    WHEN 'admin'::public.app_role THEN 2
    ELSE 3
  END
  LIMIT 1;

  IF v_target_role = 'owner'::public.app_role AND NOT v_actor_is_owner THEN
    RAISE EXCEPTION 'Only organization owners can remove owner members';
  END IF;

  IF v_target_role = 'owner'::public.app_role
  THEN
    PERFORM 1
    FROM public.user_roles
    WHERE organization_id = p_org_id
      AND role = 'owner'::public.app_role
    FOR UPDATE;

    IF public.count_org_owners(p_org_id) <= 1 THEN
      RAISE EXCEPTION 'Organization must retain at least one owner';
    END IF;
  END IF;

  DELETE FROM public.user_roles
  WHERE user_id = p_target_user_id
    AND organization_id = p_org_id;

  DELETE FROM public.organization_members
  WHERE organization_id = p_org_id
    AND user_id = p_target_user_id;

  INSERT INTO public.audit_logs (
    org_id,
    actor_user_id,
    action,
    target_type,
    target_id,
    metadata
  )
  VALUES (
    p_org_id,
    v_actor_user_id,
    'organization.member_removed',
    'organization_member',
    p_target_user_id::text,
    jsonb_build_object('old_role', v_target_role)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_organization_invite(
  p_token_hash text,
  p_actor_user_id uuid,
  p_actor_email text
)
RETURNS TABLE (
  status text,
  organization_id uuid,
  assigned_role public.app_role
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite public.organization_invites%ROWTYPE;
  v_org_name text;
BEGIN
  IF p_actor_user_id IS NULL OR NULLIF(trim(COALESCE(p_actor_email, '')), '') IS NULL THEN
    RAISE EXCEPTION 'Authenticated user context is required';
  END IF;

  SELECT *
  INTO v_invite
  FROM public.organization_invites
  WHERE token_hash = p_token_hash
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 'invalid'::text, NULL::uuid, NULL::public.app_role;
    RETURN;
  END IF;

  IF lower(v_invite.email) <> lower(trim(p_actor_email)) THEN
    RETURN QUERY SELECT 'email_mismatch'::text, v_invite.organization_id, v_invite.role;
    RETURN;
  END IF;

  IF v_invite.accepted_at IS NOT NULL THEN
    RETURN QUERY SELECT 'already_accepted'::text, v_invite.organization_id, v_invite.role;
    RETURN;
  END IF;

  IF v_invite.expires_at <= now() THEN
    RETURN QUERY SELECT 'expired'::text, v_invite.organization_id, v_invite.role;
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id = v_invite.organization_id
      AND user_id = p_actor_user_id
  ) OR EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE organization_id = v_invite.organization_id
      AND user_id = p_actor_user_id
  ) THEN
    UPDATE public.organization_invites
    SET accepted_at = now()
    WHERE id = v_invite.id;

    INSERT INTO public.audit_logs (
      org_id,
      actor_user_id,
      action,
      target_type,
      target_id,
      metadata
    )
    VALUES (
      v_invite.organization_id,
      p_actor_user_id,
      'organization.invite_accepted_existing_member',
      'organization_invite',
      v_invite.id::text,
      jsonb_build_object('email', v_invite.email, 'role', v_invite.role)
    );

    RETURN QUERY SELECT 'already_member'::text, v_invite.organization_id, v_invite.role;
    RETURN;
  END IF;

  INSERT INTO public.organization_members (organization_id, user_id)
  VALUES (v_invite.organization_id, p_actor_user_id);

  DELETE FROM public.user_roles
  WHERE organization_id = v_invite.organization_id
    AND user_id = p_actor_user_id;

  INSERT INTO public.user_roles (user_id, organization_id, role)
  VALUES (p_actor_user_id, v_invite.organization_id, v_invite.role);

  UPDATE public.organization_invites
  SET accepted_at = now()
  WHERE id = v_invite.id;

  SELECT name
  INTO v_org_name
  FROM public.organizations
  WHERE id = v_invite.organization_id;

  INSERT INTO public.audit_logs (
    org_id,
    actor_user_id,
    action,
    target_type,
    target_id,
    metadata
  )
  VALUES (
    v_invite.organization_id,
    p_actor_user_id,
    'organization.invite_accepted',
    'organization_invite',
    v_invite.id::text,
    jsonb_build_object(
      'email', v_invite.email,
      'role', v_invite.role,
      'organization_name', v_org_name
    )
  );

  RETURN QUERY SELECT 'accepted'::text, v_invite.organization_id, v_invite.role;
END;
$$;

DROP POLICY IF EXISTS "Admins can manage members" ON public.organization_members;

CREATE POLICY "Org admins can insert memberships"
  ON public.organization_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::public.app_role, 'admin'::public.app_role])
    AND NOT public.has_org_role(user_id, organization_id, ARRAY['owner'::public.app_role])
  );

CREATE POLICY "Org admins can update memberships"
  ON public.organization_members
  FOR UPDATE
  TO authenticated
  USING (
    public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::public.app_role, 'admin'::public.app_role])
  )
  WITH CHECK (
    public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::public.app_role, 'admin'::public.app_role])
  );

CREATE POLICY "Org admins can delete non-owner memberships"
  ON public.organization_members
  FOR DELETE
  TO authenticated
  USING (
    public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::public.app_role, 'admin'::public.app_role])
    AND NOT public.has_org_role(user_id, organization_id, ARRAY['owner'::public.app_role])
  );

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Owners can manage roles" ON public.user_roles;

CREATE POLICY "Users can view organization roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::public.app_role, 'admin'::public.app_role])
  );

CREATE POLICY "Org admins can insert non-owner roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::public.app_role, 'admin'::public.app_role])
    AND (
      role <> 'owner'::public.app_role
      OR public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::public.app_role])
    )
  );

CREATE POLICY "Org admins can update non-owner roles"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (
    public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::public.app_role, 'admin'::public.app_role])
    AND (
      role <> 'owner'::public.app_role
      OR public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::public.app_role])
    )
  )
  WITH CHECK (
    public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::public.app_role, 'admin'::public.app_role])
    AND (
      role <> 'owner'::public.app_role
      OR public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::public.app_role])
    )
  );

CREATE POLICY "Org admins can delete non-owner roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (
    public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::public.app_role, 'admin'::public.app_role])
    AND role <> 'owner'::public.app_role
  );

CREATE POLICY "Org admins can view audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    public.has_org_role(auth.uid(), org_id, ARRAY['owner'::public.app_role, 'admin'::public.app_role])
  );

CREATE POLICY "Org admins can view invites"
  ON public.organization_invites
  FOR SELECT
  TO authenticated
  USING (
    public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::public.app_role, 'admin'::public.app_role])
  );

CREATE POLICY "Org admins can create invites"
  ON public.organization_invites
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::public.app_role, 'admin'::public.app_role])
    AND (
      role <> 'owner'::public.app_role
      OR public.has_org_role(auth.uid(), organization_id, ARRAY['owner'::public.app_role])
    )
  );

REVOKE ALL ON FUNCTION public.has_org_role(uuid, uuid, public.app_role[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_org_role(uuid, uuid, public.app_role[]) TO authenticated;

REVOKE ALL ON FUNCTION public.count_org_owners(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.count_org_owners(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.create_organization_atomic(text, text, text, text, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_organization_atomic(text, text, text, text, text, text, text, text, text, text) TO authenticated;

REVOKE ALL ON FUNCTION public.set_org_member_role(uuid, uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_org_member_role(uuid, uuid, public.app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.remove_org_member(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.remove_org_member(uuid, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.accept_organization_invite(text, uuid, text) FROM PUBLIC;
