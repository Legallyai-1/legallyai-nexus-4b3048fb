create extension if not exists pgcrypto with schema extensions;
create or replace function public.create_api_key(p_name text default 'Default')
returns table(id uuid, name text, key text, key_prefix text, created_at timestamptz)
language plpgsql security definer set search_path = public, extensions as $$
declare v_key text; v_hash text; v_id uuid; v_count integer;
begin
  if auth.uid() is null then raise exception 'Sign in required' using errcode = '28000'; end if;
  if not public.has_api_subscription(auth.uid()) then
    raise exception 'An active LegallyAI subscription or free trial is required to create API keys' using errcode = 'P0001';
  end if;
  select count(*) into v_count from public.api_keys k where k.user_id = auth.uid() and k.revoked_at is null;
  if v_count >= 5 then raise exception 'Limit of 5 active API keys reached' using errcode = 'P0001'; end if;
  v_key := 'lai_live_' || encode(extensions.gen_random_bytes(24), 'hex');
  v_hash := encode(extensions.digest(v_key, 'sha256'), 'hex');
  insert into public.api_keys (user_id, name, key_prefix, key_hash)
  values (auth.uid(), coalesce(nullif(trim(p_name), ''), 'Default'), left(v_key, 14), v_hash)
  returning api_keys.id into v_id;
  return query select v_id, coalesce(nullif(trim(p_name), ''), 'Default'), v_key, left(v_key, 14), now();
end $$;
create or replace function public.use_api_key(p_key text, p_daily_limit integer)
returns table(user_id uuid, allowed boolean, used_today integer)
language plpgsql security definer set search_path = public, extensions as $$
declare v_hash text; r public.api_keys%rowtype;
begin
  v_hash := encode(extensions.digest(p_key, 'sha256'), 'hex');
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
