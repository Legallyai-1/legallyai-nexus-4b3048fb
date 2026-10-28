-- Developer API keys for LegallyAI (requires an active subscription or trial).
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Default',
  key_prefix text not null,               -- first 12 chars, shown in the UI
  key_hash text not null unique,          -- sha256 of the full key; the key itself is never stored
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz,
  requests_total bigint not null default 0,
  requests_today integer not null default 0,
  requests_day date not null default current_date
);
create index if not exists api_keys_user_idx on public.api_keys(user_id);
alter table public.api_keys enable row level security;
drop policy if exists api_keys_owner_select on public.api_keys;
create policy api_keys_owner_select on public.api_keys for select to authenticated using (user_id = auth.uid());
drop policy if exists api_keys_owner_update on public.api_keys;
create policy api_keys_owner_update on public.api_keys for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
-- Inserts happen only through create_api_key() below.

create or replace function public.has_api_subscription(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.subscriptions s
    where s.user_id = p_user and s.status in ('active','trialing')
      and (s.current_period_end is null or s.current_period_end > now())
  ) or exists (
    select 1 from public.payment_records p
    where p.user_id = p_user and p.status in ('verified','active','paid','succeeded')
      and (p.expires_at is null or p.expires_at > now())
  ) or exists (
    select 1 from public.profiles pr
    where pr.id = p_user and coalesce(pr.manual_subscription_tier, pr.subscription_tier) not in ('free','')
      and coalesce(pr.manual_subscription_tier, pr.subscription_tier) is not null
  );
$$;
grant execute on function public.has_api_subscription(uuid) to authenticated, service_role;

-- Creates a key for the signed-in user. Returns the full key exactly once.
create or replace function public.create_api_key(p_name text default 'Default')
returns table(id uuid, name text, key text, key_prefix text, created_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare v_key text; v_hash text; v_id uuid; v_count integer;
begin
  if auth.uid() is null then raise exception 'Sign in required' using errcode = '28000'; end if;
  if not public.has_api_subscription(auth.uid()) then
    raise exception 'An active LegallyAI subscription or free trial is required to create API keys' using errcode = 'P0001';
  end if;
  select count(*) into v_count from public.api_keys k where k.user_id = auth.uid() and k.revoked_at is null;
  if v_count >= 5 then raise exception 'Limit of 5 active API keys reached' using errcode = 'P0001'; end if;
  v_key := 'lai_live_' || encode(gen_random_bytes(24), 'hex');
  v_hash := encode(digest(v_key, 'sha256'), 'hex');
  insert into public.api_keys (user_id, name, key_prefix, key_hash)
  values (auth.uid(), coalesce(nullif(trim(p_name), ''), 'Default'), left(v_key, 14), v_hash)
  returning api_keys.id into v_id;
  return query select v_id, coalesce(nullif(trim(p_name), ''), 'Default'), v_key, left(v_key, 14), now();
end $$;
revoke all on function public.create_api_key(text) from public, anon;
grant execute on function public.create_api_key(text) to authenticated;

-- Validates a key and counts a request. Service role only (called by edge functions).
create or replace function public.use_api_key(p_key text, p_daily_limit integer)
returns table(user_id uuid, allowed boolean, used_today integer)
language plpgsql security definer set search_path = public as $$
declare v_hash text; r public.api_keys%rowtype;
begin
  v_hash := encode(digest(p_key, 'sha256'), 'hex');
  select * into r from public.api_keys k where k.key_hash = v_hash and k.revoked_at is null for update;
  if not found then return; end if;
  if not public.has_api_subscription(r.user_id) then return query select r.user_id, false, r.requests_today; return; end if;
  if r.requests_day <> current_date then r.requests_today := 0; r.requests_day := current_date; end if;
  if r.requests_today >= p_daily_limit then
    update public.api_keys k set requests_today = r.requests_today, requests_day = r.requests_day where k.id = r.id;
    return query select r.user_id, false, r.requests_today; return;
  end if;
  update public.api_keys k set requests_today = r.requests_today + 1, requests_day = r.requests_day,
    requests_total = k.requests_total + 1, last_used_at = now() where k.id = r.id;
  return query select r.user_id, true, r.requests_today + 1;
end $$;
revoke all on function public.use_api_key(text, integer) from public, anon, authenticated;
grant execute on function public.use_api_key(text, integer) to service_role;
create extension if not exists pgcrypto;
