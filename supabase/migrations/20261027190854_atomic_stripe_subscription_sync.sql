-- Apply before deploying the Vercel webhook repair. No historical data backfill.
create or replace function public.sync_stripe_subscription_state(
  p_user_id uuid, p_stripe_customer_id text, p_stripe_subscription_id text,
  p_status text, p_tier text, p_stripe_price_id text, p_stripe_product_id text,
  p_current_period_start timestamptz, p_current_period_end timestamptz,
  p_cancel_at_period_end boolean, p_metadata jsonb, p_event_id text,
  p_event_created_at timestamptz
) returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare applied boolean;
begin
  if p_event_created_at is null or p_event_id is null or btrim(p_event_id) = '' then
    raise exception 'Stripe event identity and timestamp required';
  end if;
  select public.upsert_subscription_state(
    p_user_id, p_stripe_customer_id, p_stripe_subscription_id, p_status, p_tier,
    p_stripe_price_id, p_stripe_product_id, p_current_period_start, p_current_period_end,
    p_cancel_at_period_end, p_metadata, p_event_id, p_event_created_at
  ) into applied;
  if applied then
    update public.profiles
    set subscription_tier = case when p_status in ('active', 'trialing', 'past_due') then p_tier else 'free' end,
        updated_at = now()
    where id = p_user_id;
    if not found then raise exception 'Billing profile missing'; end if;
  end if;
  return coalesce(applied, false);
end;
$$;
revoke all on function public.sync_stripe_subscription_state(uuid,text,text,text,text,text,text,timestamptz,timestamptz,boolean,jsonb,text,timestamptz) from public, anon, authenticated;
grant execute on function public.sync_stripe_subscription_state(uuid,text,text,text,text,text,text,timestamptz,timestamptz,boolean,jsonb,text,timestamptz) to service_role;
