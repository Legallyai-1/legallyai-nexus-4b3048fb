DO $migration$
DECLARE
  v_policy record;
BEGIN
  IF to_regclass('public.org_members') IS NULL THEN
    RETURN;
  END IF;

  FOR v_policy IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'org_members'
      AND cmd IN ('ALL', 'INSERT', 'UPDATE', 'DELETE')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.org_members', v_policy.policyname);
  END LOOP;

  EXECUTE $ddl$
    CREATE OR REPLACE FUNCTION public.org_members_actor_has_role(p_org_id uuid, p_role text)
    RETURNS boolean
    LANGUAGE plpgsql
    STABLE
    SECURITY DEFINER
    SET search_path = pg_catalog, public, auth
    AS $body$
    BEGIN
      RETURN EXISTS (
        SELECT 1
        FROM public.org_members AS member
        WHERE member.org_id = p_org_id
          AND member.user_id = auth.uid()
          AND member.role::text = p_role
      );
    END;
    $body$
  $ddl$;

  EXECUTE $ddl$
    CREATE OR REPLACE FUNCTION public.set_live_org_member_role(
      p_org_id uuid,
      p_target_user_id uuid,
      p_new_role text
    )
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = pg_catalog, public, auth
    AS $body$
    DECLARE
      v_actor_user_id uuid := auth.uid();
      v_actor_is_owner boolean;
      v_old_role text;
      v_role_type text;
      v_owner_count bigint;
    BEGIN
      IF v_actor_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
      END IF;
      IF p_org_id IS NULL OR p_target_user_id IS NULL THEN
        RAISE EXCEPTION 'Organization and target user are required';
      END IF;
      IF p_new_role IS NULL
         OR p_new_role NOT IN ('owner', 'admin', 'manager', 'lawyer', 'paralegal', 'employee', 'client') THEN
        RAISE EXCEPTION 'Invalid organization role';
      END IF;

      PERFORM pg_advisory_xact_lock(hashtextextended(p_org_id::text, 0));

      v_actor_is_owner := public.org_members_actor_has_role(p_org_id, 'owner');
      IF NOT v_actor_is_owner
         AND NOT public.org_members_actor_has_role(p_org_id, 'admin') THEN
        RAISE EXCEPTION 'Only organization owners or admins can manage member roles';
      END IF;

      SELECT member.role::text
      INTO v_old_role
      FROM public.org_members AS member
      WHERE member.org_id = p_org_id
        AND member.user_id = p_target_user_id
      FOR UPDATE;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Target user is not an organization member';
      END IF;

      IF NOT v_actor_is_owner
         AND (p_new_role = 'owner' OR v_old_role = 'owner') THEN
        RAISE EXCEPTION 'Only organization owners can manage owner roles';
      END IF;

      IF v_old_role = 'owner' AND p_new_role <> 'owner' THEN
        SELECT count(*)
        INTO v_owner_count
        FROM public.org_members AS member
        WHERE member.org_id = p_org_id
          AND member.role::text = 'owner';
        IF v_owner_count <= 1 THEN
          RAISE EXCEPTION 'Organization must retain at least one owner';
        END IF;
      END IF;

      SELECT pg_catalog.format_type(attribute.atttypid, attribute.atttypmod)
      INTO v_role_type
      FROM pg_catalog.pg_attribute AS attribute
      WHERE attribute.attrelid = 'public.org_members'::regclass
        AND attribute.attname = 'role'
        AND attribute.attnum > 0
        AND NOT attribute.attisdropped;

      EXECUTE pg_catalog.format(
        'UPDATE public.org_members SET role = $1::%s WHERE org_id = $2 AND user_id = $3',
        v_role_type
      ) USING p_new_role, p_org_id, p_target_user_id;

      IF to_regclass('public.audit_logs') IS NOT NULL THEN
        EXECUTE
          'INSERT INTO public.audit_logs (org_id, actor_user_id, action, target_type, target_id, metadata)
           VALUES ($1, $2, $3, $4, $5, $6)'
        USING p_org_id, v_actor_user_id, 'organization.member_role_changed',
          'organization_member', p_target_user_id::text,
          jsonb_build_object('old_role', v_old_role, 'new_role', p_new_role);
      END IF;
    END;
    $body$
  $ddl$;

  EXECUTE $ddl$
    CREATE OR REPLACE FUNCTION public.remove_live_org_member(
      p_org_id uuid,
      p_target_user_id uuid
    )
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = pg_catalog, public, auth
    AS $body$
    DECLARE
      v_actor_user_id uuid := auth.uid();
      v_actor_is_owner boolean;
      v_target_role text;
      v_owner_count bigint;
    BEGIN
      IF v_actor_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
      END IF;
      IF p_org_id IS NULL OR p_target_user_id IS NULL THEN
        RAISE EXCEPTION 'Organization and target user are required';
      END IF;

      PERFORM pg_advisory_xact_lock(hashtextextended(p_org_id::text, 0));

      v_actor_is_owner := public.org_members_actor_has_role(p_org_id, 'owner');
      IF NOT v_actor_is_owner
         AND NOT public.org_members_actor_has_role(p_org_id, 'admin') THEN
        RAISE EXCEPTION 'Only organization owners or admins can remove members';
      END IF;

      SELECT member.role::text
      INTO v_target_role
      FROM public.org_members AS member
      WHERE member.org_id = p_org_id
        AND member.user_id = p_target_user_id
      FOR UPDATE;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Target user is not an organization member';
      END IF;

      IF v_target_role = 'owner' AND NOT v_actor_is_owner THEN
        RAISE EXCEPTION 'Only organization owners can remove owner members';
      END IF;

      IF v_target_role = 'owner' THEN
        SELECT count(*)
        INTO v_owner_count
        FROM public.org_members AS member
        WHERE member.org_id = p_org_id
          AND member.role::text = 'owner';
        IF v_owner_count <= 1 THEN
          RAISE EXCEPTION 'Organization must retain at least one owner';
        END IF;
      END IF;

      DELETE FROM public.org_members AS member
      WHERE member.org_id = p_org_id
        AND member.user_id = p_target_user_id;

      IF to_regclass('public.audit_logs') IS NOT NULL THEN
        EXECUTE
          'INSERT INTO public.audit_logs (org_id, actor_user_id, action, target_type, target_id, metadata)
           VALUES ($1, $2, $3, $4, $5, $6)'
        USING p_org_id, v_actor_user_id, 'organization.member_removed',
          'organization_member', p_target_user_id::text,
          jsonb_build_object('old_role', v_target_role);
      END IF;
    END;
    $body$
  $ddl$;

  EXECUTE 'ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY';
  EXECUTE $ddl$
    CREATE POLICY org_members_insert_non_owner
    ON public.org_members
    FOR INSERT
    TO authenticated
    WITH CHECK (
      role::text <> 'owner'
      AND (
        public.org_members_actor_has_role(org_id, 'owner')
        OR public.org_members_actor_has_role(org_id, 'admin')
      )
    )
  $ddl$;
  EXECUTE $ddl$
    CREATE POLICY org_members_update_rpc_only
    ON public.org_members
    FOR UPDATE
    TO authenticated
    USING (false)
    WITH CHECK (false)
  $ddl$;
  EXECUTE $ddl$
    CREATE POLICY org_members_delete_rpc_only
    ON public.org_members
    FOR DELETE
    TO authenticated
    USING (false)
  $ddl$;

  EXECUTE 'REVOKE ALL ON FUNCTION public.org_members_actor_has_role(uuid, text) FROM PUBLIC, anon';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.org_members_actor_has_role(uuid, text) TO authenticated';
  EXECUTE 'REVOKE ALL ON FUNCTION public.set_live_org_member_role(uuid, uuid, text) FROM PUBLIC, anon';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.set_live_org_member_role(uuid, uuid, text) TO authenticated';
  EXECUTE 'REVOKE ALL ON FUNCTION public.remove_live_org_member(uuid, uuid) FROM PUBLIC, anon';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.remove_live_org_member(uuid, uuid) TO authenticated';
END;
$migration$;
