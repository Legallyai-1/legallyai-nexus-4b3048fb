-- Tighten write policies so org_id must belong to the caller, and let account deletion succeed.
DO $$
DECLARE
  t text;
  tbls text[] := ARRAY['appointments','cases','invoices','job_listings','messages','legal_doc_extractions'];
  check_expr text := '(user_id = (SELECT auth.uid()) AND (org_id IS NULL OR org_id IN (SELECT m.org_id FROM public.org_members m WHERE m.user_id = (SELECT auth.uid()))))';
  pol record;
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    CONTINUE WHEN to_regclass('public.' || t) IS NULL;
    CONTINUE WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=t AND column_name='org_id');
    CONTINUE WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=t AND column_name='user_id');
    FOR pol IN SELECT policyname, cmd FROM pg_policies WHERE schemaname='public' AND tablename=t AND cmd IN ('INSERT','UPDATE') AND (policyname LIKE '%\_insert\_access' OR policyname LIKE '%\_update\_access') LOOP
      IF pol.cmd = 'INSERT' THEN
        EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, t);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (%s)', pol.policyname, t, check_expr);
      ELSE
        EXECUTE format('ALTER POLICY %I ON public.%I WITH CHECK (%s)', pol.policyname, t, check_expr);
      END IF;
    END LOOP;
  END LOOP;
END
$$;

-- User-owned rows cascade; nullable attribution columns are set to NULL when a profile is removed.
DO $$
DECLARE
  fk record;
  nullable boolean;
BEGIN
  FOR fk IN
    SELECT c.conrelid::regclass AS tbl, c.conname, a.attname AS col, a.attnotnull AS notnull, pg_get_constraintdef(c.oid) AS def
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = c.conkey[1]
    WHERE c.contype = 'f' AND c.confrelid = 'public.profiles'::regclass AND c.confdeltype = 'a' AND array_length(c.conkey,1) = 1
  LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', fk.tbl, fk.conname);
    EXECUTE format('ALTER TABLE %s ADD CONSTRAINT %I %s ON DELETE %s', fk.tbl, fk.conname, fk.def,
      CASE WHEN fk.notnull THEN 'CASCADE' ELSE 'SET NULL' END);
  END LOOP;
END
$$;
