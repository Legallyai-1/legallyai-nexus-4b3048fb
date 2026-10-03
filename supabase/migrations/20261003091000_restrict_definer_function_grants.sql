-- SECURITY DEFINER functions must not be callable by anon; webhook-only functions are service_role only.
DO $$
DECLARE
  fn regprocedure;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure
    FROM pg_proc p
    WHERE p.pronamespace = 'public'::regnamespace AND p.prosecdef
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', fn);
  END LOOP;
END
$$;

REVOKE EXECUTE ON FUNCTION public.upsert_subscription_state(uuid, text, text, text, text, text, text, timestamptz, timestamptz, boolean, jsonb, text, timestamptz) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_webhook_log(text, text, text, jsonb, text, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.set_organization_owner_id() FROM authenticated;
