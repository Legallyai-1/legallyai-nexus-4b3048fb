-- Enforce firm seat limits in the database (follow-up to !133, see seat-limits-mr133.md).
--
-- The app checks seats in organization-seats.ts, but the RLS policy
-- "Org admins can insert memberships" still lets a direct insert go past the plan limit.
-- This trigger is the backstop.
--
-- Seats = the org owner + active organization_members holding at least one non-client role in that org.
-- (The app also counts active members with no role at all; the DB is never stricter than the app.)
-- Limit = owner's live subscription (active / trialing / past_due):
--   Solo 1, Firm 3 + extra_seats, Enterprise 10 + extra_seats (extra_seats capped at 100),
--   matched by stripe_price_id first, then tier ('pro' -> Firm, 'enterprise' -> Enterprise).
--   Owner with no live seat plan (free / premium / per document) -> no limit (same as the app).
--
-- Checked by DEFERRABLE INITIALLY DEFERRED constraint triggers on organization_members (new member,
-- reactivation) and user_roles (promotion to a non-client role), because accept_organization_invite
-- inserts organization_members before user_roles, so whether the new member is a client is only
-- known at commit.
--
-- Safety: it only checks NEW active member rows, reactivations (is_active false/null -> true), and
-- non-client roles given to a member who did not already hold a seat.
-- Existing rows, the owner, other updates and deletes are never blocked, and a firm already over its
-- limit keeps everyone (only further seat-using adds are blocked). Clients never use a seat.
--
-- Known gaps (kept on purpose): pending invites are not counted here (the app counts them);
-- the payment_records fallback is not used.

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
  -- Seat = the owner + every active member holding at least one non-client role in this org.
  -- (Same rule as public.organization_member_is_seat, used by both triggers.)
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
       and exists (select 1 from public.user_roles r
                    where r.user_id = m.user_id and r.organization_id = _organization_id
                      and r.role::text <> 'client')
  )
  select count(*)::integer from staff;
$$;

create or replace function public.organization_member_is_seat(_organization_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members m
     where m.organization_id = _organization_id
       and m.user_id = _user_id
       and m.is_active is true
  ) and exists (
    select 1 from public.user_roles r
     where r.user_id = _user_id and r.organization_id = _organization_id
       and r.role::text <> 'client'
  );
$$;

-- Shared check for both triggers. Runs at commit (deferred), against the rows as they are then.
create or replace function public.assert_organization_seat_available(_organization_id uuid, _user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  _owner uuid;
  _limit integer;
  _used integer;
begin
  if _organization_id is null or _user_id is null then
    return;
  end if;

  -- The owner always has a seat.
  select o.owner_id into _owner from public.organizations o where o.id = _organization_id;
  if _owner is null or _user_id = _owner then
    return;
  end if;

  -- Not (or no longer) an active member with a non-client role: uses no seat, nothing to check.
  if not public.organization_member_is_seat(_organization_id, _user_id) then
    return;
  end if;

  -- Serialize seat checks per org. Deferred checks in two concurrent transactions would otherwise
  -- each count only their own new member (READ COMMITTED) and both commit past the limit. The
  -- transaction-scoped advisory lock makes the second wait until the first commits or rolls back;
  -- the count below then runs with a fresh snapshot and sees the first one's member.
  perform pg_advisory_xact_lock(hashtext('org_seats:' || _organization_id::text));

  _limit := public.organization_seat_limit(_organization_id);
  if _limit is null then
    return;
  end if;

  -- Seats used include this member. A firm already over its limit keeps everyone; it just cannot
  -- add, reactivate or promote another seat until it is back under the limit.
  _used := public.organization_seats_used(_organization_id);
  if _used > _limit then
    raise exception 'Seat limit reached for this plan. Add seats in Settings.'
      using errcode = 'P0001',
            detail = format('%s of %s seats would be in use.', _used, _limit),
            hint = 'The firm owner can add seats in Settings, or deactivate a member first.';
  end if;
end;
$$;

-- organization_members: a NEW active member row or a reactivation.
create or replace function public.enforce_organization_seat_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.assert_organization_seat_available(new.organization_id, new.user_id);
  return null;
end;
$$;

-- user_roles, immediate BEFORE trigger: remembers, once per transaction, whether the user already
-- held a seat before this transaction first touched their roles in the org. set_org_member_role
-- changes a role by DELETE + INSERT, so this is what keeps a staff -> staff role change in an
-- over-limit firm from being treated as a new seat. The marker is transaction-local (set_config
-- with is_local = true) and only these SECURITY DEFINER trigger functions write it.
create or replace function public.remember_organization_seat_before_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  _org uuid := case when tg_op = 'DELETE' then old.organization_id else new.organization_id end;
  _user uuid := case when tg_op = 'DELETE' then old.user_id else new.user_id end;
  _key text;
begin
  if _org is not null then
    _key := 'legallyai_seat_before.u' || md5(_org::text || ':' || _user::text);
    if coalesce(current_setting(_key, true), '') = '' then
      perform set_config(_key,
        case when public.organization_member_is_seat(_org, _user) then 'seat' else 'none' end, true);
    end if;
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

-- user_roles, deferred: a non-client role given to an active, non-owner member who did not already
-- hold a seat when the transaction started changing their roles (promotion from client, or a staff
-- role added to a member who had none).
create or replace function public.enforce_organization_seat_limit_on_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.organization_id is null or new.role::text = 'client' then
    return null;
  end if;
  if current_setting('legallyai_seat_before.u' || md5(new.organization_id::text || ':' || new.user_id::text), true) = 'seat' then
    return null;
  end if;
  perform public.assert_organization_seat_available(new.organization_id, new.user_id);
  return null;
end;
$$;

-- Never fires on DELETE (of either table), on member updates that do not reactivate, or on existing rows.
drop trigger if exists organization_members_seat_limit on public.organization_members;
drop trigger if exists organization_members_seat_limit_insert on public.organization_members;
drop trigger if exists organization_members_seat_limit_reactivate on public.organization_members;
drop trigger if exists user_roles_seat_before_change on public.user_roles;
drop trigger if exists user_roles_seat_limit on public.user_roles;

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

create trigger user_roles_seat_before_change
  before insert or update of role, organization_id, user_id or delete on public.user_roles
  for each row
  execute function public.remember_organization_seat_before_role_change();

create constraint trigger user_roles_seat_limit
  after insert or update of role on public.user_roles
  deferrable initially deferred
  for each row
  when (new.organization_id is not null and new.role::text <> 'client')
  execute function public.enforce_organization_seat_limit_on_role();

revoke all on function public.organization_seat_limit(uuid) from public, anon, authenticated;
revoke all on function public.organization_seats_used(uuid) from public, anon, authenticated;
revoke all on function public.organization_member_is_seat(uuid, uuid) from public, anon, authenticated;
revoke all on function public.assert_organization_seat_available(uuid, uuid) from public, anon, authenticated;
revoke all on function public.enforce_organization_seat_limit() from public, anon, authenticated;
revoke all on function public.remember_organization_seat_before_role_change() from public, anon, authenticated;
revoke all on function public.enforce_organization_seat_limit_on_role() from public, anon, authenticated;
