-- Enforce firm seat limits in the database (follow-up to !133, see seat-limits-mr133.md).
--
-- The app checks seats in organization-seats.ts, but the RLS policy
-- "Org admins can insert memberships" still lets a direct insert go past the plan limit.
-- This trigger is the backstop.
--
-- Seats = the org owner + active organization_members whose roles in that org are not all 'client'.
-- Limit = owner's live subscription (active / trialing / past_due):
--   Solo 1, Firm 3 + extra_seats, Enterprise 10 + extra_seats (extra_seats capped at 100),
--   matched by stripe_price_id first, then tier ('pro' -> Firm, 'enterprise' -> Enterprise).
--   Owner with no live seat plan (free / premium / per document) -> no limit (same as the app).
--
-- It is a DEFERRABLE INITIALLY DEFERRED constraint trigger because accept_organization_invite
-- inserts organization_members before user_roles, so whether the new member is a client is only
-- known at commit.
--
-- Safety: it only checks NEW active member rows and reactivations (is_active false/null -> true).
-- Existing rows, the owner, other updates and deletes are never blocked, and a firm already over its
-- limit keeps everyone (only further seat-using adds are blocked). Clients never use a seat.
--
-- Known gaps (kept on purpose): pending invites are not counted here (the app counts them);
-- the payment_records fallback is not used; a role change from client to staff on an existing
-- member (user_roles update) is not re-checked.

create or replace function public.organization_seat_limit(_organization_id uuid)
returns integer
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  _owner uuid;
  _sub record;
  _extra integer := 0;
  _raw text;
begin
  select o.owner_id into _owner from public.organizations o where o.id = _organization_id;
  if _owner is null then
    return null;
  end if;

  select s.stripe_price_id, s.tier::text as tier, s.metadata
    into _sub
    from public.subscriptions s
   where s.user_id = _owner
     and s.status::text in ('active', 'trialing', 'past_due')
   order by s.current_period_end desc nulls last
   limit 1;
  if not found then
    return null;
  end if;

  _raw := btrim(coalesce(_sub.metadata ->> 'extra_seats', ''));
  if _raw ~ '^\d{1,6}$' then
    _extra := least(_raw::integer, 100);
  end if;

  return case
    when _sub.stripe_price_id = 'price_1UVwxE0QhWGUtGKv3tjz0A3I' then 1             -- Solo
    when _sub.stripe_price_id = 'price_1SckV70QhWGUtGKvvg1tH7lu' then 3 + _extra    -- Firm
    when _sub.stripe_price_id = 'price_1UVwxL0QhWGUtGKvpqH8gbUR' then 10 + _extra   -- Enterprise
    when _sub.stripe_price_id = 'price_1Sdfqp0QhWGUtGKvcQuWONuB' then null          -- Premium
    when lower(coalesce(_sub.tier, '')) = 'pro' then 3 + _extra
    when lower(coalesce(_sub.tier, '')) = 'enterprise' then 10 + _extra
    else null
  end;
end;
$$;

create or replace function public.organization_seats_used(_organization_id uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  with org as (
    select o.owner_id from public.organizations o where o.id = _organization_id
  ),
  staff as (
    select owner_id as user_id from org where owner_id is not null
    union
    select m.user_id
      from public.organization_members m
     where m.organization_id = _organization_id
       and m.is_active is true
       and not (
         exists (select 1 from public.user_roles r
                  where r.user_id = m.user_id and r.organization_id = _organization_id)
         and not exists (select 1 from public.user_roles r
                  where r.user_id = m.user_id and r.organization_id = _organization_id
                    and r.role::text <> 'client')
       )
  )
  select count(*)::integer from staff;
$$;

create or replace function public.enforce_organization_seat_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  _owner uuid;
  _limit integer;
  _used integer;
begin
  -- Only fires for a NEW member row or a reactivation (see the trigger WHEN clauses). Checked at
  -- commit against the row as it is then, so a row removed or deactivated in the same transaction passes.
  if not exists (
    select 1 from public.organization_members m
     where m.organization_id = new.organization_id
       and m.user_id = new.user_id
       and m.is_active is true
  ) then
    return null;
  end if;

  -- The owner always has a seat.
  select o.owner_id into _owner from public.organizations o where o.id = new.organization_id;
  if _owner is null or new.user_id = _owner then
    return null;
  end if;

  -- A member whose roles in this org are all 'client' does not use a seat.
  if exists (select 1 from public.user_roles r
              where r.user_id = new.user_id and r.organization_id = new.organization_id)
     and not exists (select 1 from public.user_roles r
              where r.user_id = new.user_id and r.organization_id = new.organization_id
                and r.role::text <> 'client') then
    return null;
  end if;

  _limit := public.organization_seat_limit(new.organization_id);
  if _limit is null then
    return null;
  end if;

  -- Seats used now include this member. A firm already over its limit keeps everyone; it just
  -- cannot add (or reactivate) another seat until it is back under the limit.
  _used := public.organization_seats_used(new.organization_id);
  if _used > _limit then
    raise exception 'Seat limit reached for this plan. Add seats in Settings.'
      using errcode = 'P0001',
            detail = format('%s of %s seats would be in use.', _used, _limit),
            hint = 'The firm owner can add seats in Settings, or deactivate a member first.';
  end if;
  return null;
end;
$$;

-- Never fires on DELETE, on updates that do not reactivate a member, or on existing rows.
drop trigger if exists organization_members_seat_limit on public.organization_members;
drop trigger if exists organization_members_seat_limit_insert on public.organization_members;
drop trigger if exists organization_members_seat_limit_reactivate on public.organization_members;

create constraint trigger organization_members_seat_limit_insert
  after insert on public.organization_members
  deferrable initially deferred
  for each row
  when (new.is_active is true)
  execute function public.enforce_organization_seat_limit();

create constraint trigger organization_members_seat_limit_reactivate
  after update of is_active on public.organization_members
  deferrable initially deferred
  for each row
  when (old.is_active is distinct from true and new.is_active is true)
  execute function public.enforce_organization_seat_limit();

revoke all on function public.organization_seat_limit(uuid) from public, anon, authenticated;
revoke all on function public.organization_seats_used(uuid) from public, anon, authenticated;
revoke all on function public.enforce_organization_seat_limit() from public, anon, authenticated;
