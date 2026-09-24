-- Forward-only reconciliation migration for production readiness.
-- Notes:
-- 1) Historical migrations and supabase/schema.sql diverge; do not replay or
--    rewrite older migrations from this change.
-- 2) The legacy public.org_members table is intentionally left untouched.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'app_role'
  ) then
    create type public.app_role as enum (
      'owner',
      'admin',
      'manager',
      'lawyer',
      'paralegal',
      'employee',
      'client'
    );
  end if;
end
$$;

alter type public.app_role add value if not exists 'owner';
alter type public.app_role add value if not exists 'admin';
alter type public.app_role add value if not exists 'manager';
alter type public.app_role add value if not exists 'lawyer';
alter type public.app_role add value if not exists 'paralegal';
alter type public.app_role add value if not exists 'employee';
alter type public.app_role add value if not exists 'client';

do $$
begin
  if to_regclass('public.profiles') is not null then
    alter table public.profiles
      add column if not exists credits integer,
      add column if not exists subscription_tier text,
      add column if not exists updated_at timestamptz default now();

    update public.profiles
    set credits = 50
    where credits is null;

    update public.profiles
    set subscription_tier = 'free'
    where subscription_tier is null or btrim(subscription_tier) = '';

    update public.profiles
    set updated_at = coalesce(updated_at, now())
    where updated_at is null;

    alter table public.profiles
      alter column credits set default 50,
      alter column credits set not null,
      alter column subscription_tier set default 'free',
      alter column subscription_tier set not null,
      alter column updated_at set default now(),
      alter column updated_at set not null;
  end if;
end
$$;

do $$
begin
  if to_regclass('public.organizations') is not null then
    alter table public.organizations
      add column if not exists owner_id uuid;

    if not exists (
      select 1
      from pg_constraint
      where conname = 'organizations_owner_id_fkey'
        and conrelid = 'public.organizations'::regclass
    ) then
      alter table public.organizations
        add constraint organizations_owner_id_fkey
        foreign key (owner_id) references public.profiles(id) on delete set null;
    end if;

    create index if not exists idx_organizations_owner_id
      on public.organizations(owner_id);
  end if;
end
$$;

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  employee_id text,
  job_title text,
  department text,
  hourly_rate numeric(10,2),
  hire_date date,
  is_active boolean not null default true,
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

alter table public.organization_members
  add column if not exists employee_id text,
  add column if not exists job_title text,
  add column if not exists department text,
  add column if not exists hourly_rate numeric(10,2),
  add column if not exists hire_date date,
  add column if not exists is_active boolean default true,
  add column if not exists permissions jsonb default '{}'::jsonb,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.organization_members
set is_active = true
where is_active is null;

update public.organization_members
set permissions = '{}'::jsonb
where permissions is null;

update public.organization_members
set created_at = coalesce(created_at, now()),
    updated_at = coalesce(updated_at, now());

with ranked_organization_members as (
  select
    id,
    row_number() over (
      partition by organization_id, user_id
      order by updated_at desc nulls last, created_at desc nulls last, id desc
    ) as row_number
  from public.organization_members
)
delete from public.organization_members
where id in (
  select id
  from ranked_organization_members
  where row_number > 1
);

alter table public.organization_members
  alter column organization_id set not null,
  alter column user_id set not null,
  alter column is_active set default true,
  alter column is_active set not null,
  alter column permissions set default '{}'::jsonb,
  alter column permissions set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.organization_members'::regclass
      and conname = 'organization_members_organization_id_user_id_key'
  ) then
    alter table public.organization_members
      add constraint organization_members_organization_id_user_id_key
      unique (organization_id, user_id);
  end if;
end
$$;

create index if not exists idx_organization_members_user_id
  on public.organization_members(user_id);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, organization_id, role)
);

alter table public.user_roles
  add column if not exists user_id uuid references public.profiles(id) on delete cascade,
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade,
  add column if not exists created_at timestamptz default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_roles'
      and column_name = 'role'
      and udt_name <> 'app_role'
  ) then
    alter table public.user_roles
      alter column role type public.app_role
      using role::public.app_role;
  end if;
end
$$;

update public.user_roles
set created_at = coalesce(created_at, now())
where created_at is null;

with ranked_user_roles as (
  select
    id,
    row_number() over (
      partition by user_id, organization_id, role
      order by created_at desc nulls last, id desc
    ) as row_number
  from public.user_roles
)
delete from public.user_roles
where id in (
  select id
  from ranked_user_roles
  where row_number > 1
);

alter table public.user_roles
  alter column user_id set not null,
  alter column role set not null,
  alter column created_at set default now(),
  alter column created_at set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.user_roles'::regclass
      and conname = 'user_roles_user_id_organization_id_role_key'
  ) then
    alter table public.user_roles
      add constraint user_roles_user_id_organization_id_role_key
      unique (user_id, organization_id, role);
  end if;
end
$$;

create index if not exists idx_user_roles_user_id
  on public.user_roles(user_id);

create index if not exists idx_user_roles_org_id
  on public.user_roles(organization_id);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  address text,
  notes text,
  intake_date date default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clients
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade,
  add column if not exists user_id uuid references public.profiles(id) on delete set null,
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists address text,
  add column if not exists notes text,
  add column if not exists intake_date date default current_date,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.clients
set intake_date = coalesce(intake_date, current_date),
    created_at = coalesce(created_at, now()),
    updated_at = coalesce(updated_at, now());

alter table public.clients
  alter column organization_id set not null,
  alter column full_name set not null,
  alter column intake_date set default current_date,
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

create index if not exists idx_clients_organization_id
  on public.clients(organization_id);

create index if not exists idx_clients_user_id
  on public.clients(user_id);

do $$
begin
  if to_regclass('public.ai_chat_history') is null then
    create table public.ai_chat_history (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references public.profiles(id) on delete cascade,
      hub_type text not null,
      session_id text not null,
      messages jsonb not null default '[]'::jsonb,
      metadata jsonb not null default '{}'::jsonb,
      is_archived boolean not null default false,
      searchable_text text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  end if;
end
$$;

alter table public.ai_chat_history
  alter column session_id type text using session_id::text;

alter table public.ai_chat_history
  add column if not exists hub_type text,
  add column if not exists metadata jsonb default '{}'::jsonb,
  add column if not exists is_archived boolean default false,
  add column if not exists searchable_text text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.ai_chat_history
set messages = coalesce(messages, '[]'::jsonb),
    metadata = coalesce(metadata, '{}'::jsonb),
    is_archived = coalesce(is_archived, false),
    created_at = coalesce(created_at, now()),
    updated_at = coalesce(updated_at, now());

alter table public.ai_chat_history
  alter column user_id set not null,
  alter column hub_type set not null,
  alter column session_id set not null,
  alter column messages set default '[]'::jsonb,
  alter column messages set not null,
  alter column metadata set default '{}'::jsonb,
  alter column metadata set not null,
  alter column is_archived set default false,
  alter column is_archived set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

with ranked_chat_history as (
  select
    id,
    row_number() over (
      partition by user_id, session_id
      order by updated_at desc nulls last, created_at desc nulls last, id desc
    ) as row_number
  from public.ai_chat_history
)
delete from public.ai_chat_history
where id in (
  select id
  from ranked_chat_history
  where row_number > 1
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.ai_chat_history'::regclass
      and conname = 'ai_chat_history_user_id_session_id_key'
  ) then
    alter table public.ai_chat_history
      add constraint ai_chat_history_user_id_session_id_key
      unique (user_id, session_id);
  end if;
end
$$;

create index if not exists idx_ai_chat_history_user_updated
  on public.ai_chat_history(user_id, updated_at desc);

create index if not exists idx_ai_chat_history_hub
  on public.ai_chat_history(hub_type);

create index if not exists idx_ai_chat_history_search
  on public.ai_chat_history
  using gin (to_tsvector('english', coalesce(searchable_text, '')));

create table if not exists public.ai_credits_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  delta integer not null,
  reason text not null,
  balance_after integer not null,
  created_at timestamptz not null default now()
);

alter table public.ai_credits_ledger
  add column if not exists created_at timestamptz default now();

update public.ai_credits_ledger
set created_at = coalesce(created_at, now())
where created_at is null;

alter table public.ai_credits_ledger
  alter column user_id set not null,
  alter column delta set not null,
  alter column reason set not null,
  alter column balance_after set not null,
  alter column created_at set default now(),
  alter column created_at set not null;

create index if not exists idx_ai_credits_ledger_user_created_at
  on public.ai_credits_ledger(user_id, created_at desc);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive',
  tier text not null default 'free',
  stripe_price_id text,
  stripe_product_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  last_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists status text default 'inactive',
  add column if not exists tier text default 'free',
  add column if not exists stripe_price_id text,
  add column if not exists stripe_product_id text,
  add column if not exists current_period_start timestamptz,
  add column if not exists current_period_end timestamptz,
  add column if not exists cancel_at_period_end boolean default false,
  add column if not exists metadata jsonb default '{}'::jsonb,
  add column if not exists last_event_id text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.subscriptions
set status = coalesce(status, 'inactive'),
    tier = coalesce(tier, 'free'),
    cancel_at_period_end = coalesce(cancel_at_period_end, false),
    metadata = coalesce(metadata, '{}'::jsonb),
    created_at = coalesce(created_at, now()),
    updated_at = coalesce(updated_at, now());

with ranked_subscriptions_by_user as (
  select
    id,
    row_number() over (
      partition by user_id
      order by updated_at desc nulls last, created_at desc nulls last, id desc
    ) as row_number
  from public.subscriptions
)
delete from public.subscriptions
where id in (
  select id
  from ranked_subscriptions_by_user
  where row_number > 1
);

with ranked_subscriptions_by_stripe as (
  select
    id,
    row_number() over (
      partition by stripe_subscription_id
      order by updated_at desc nulls last, created_at desc nulls last, id desc
    ) as row_number
  from public.subscriptions
  where stripe_subscription_id is not null
)
delete from public.subscriptions
where id in (
  select id
  from ranked_subscriptions_by_stripe
  where row_number > 1
);

alter table public.subscriptions
  alter column user_id set not null,
  alter column status set default 'inactive',
  alter column status set not null,
  alter column tier set default 'free',
  alter column tier set not null,
  alter column cancel_at_period_end set default false,
  alter column cancel_at_period_end set not null,
  alter column metadata set default '{}'::jsonb,
  alter column metadata set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

create unique index if not exists subscriptions_user_id_key
  on public.subscriptions(user_id);

create unique index if not exists subscriptions_stripe_subscription_id_key
  on public.subscriptions(stripe_subscription_id);

create index if not exists idx_subscriptions_status
  on public.subscriptions(status);

create index if not exists idx_subscriptions_customer_id
  on public.subscriptions(stripe_customer_id);

create table if not exists public.payment_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  tier text not null,
  amount numeric(10,2) not null default 0,
  payment_method text not null,
  verified_at timestamptz not null default now(),
  expires_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if to_regclass('public.payment_records') is not null then
    alter table public.payment_records
      add column if not exists stripe_customer_id text,
      add column if not exists stripe_subscription_id text,
      add column if not exists stripe_price_id text,
      add column if not exists stripe_product_id text,
      add column if not exists stripe_checkout_session_id text,
      add column if not exists stripe_invoice_id text,
      add column if not exists stripe_charge_id text,
      add column if not exists status text default 'succeeded',
      add column if not exists last_event_id text;

    update public.payment_records
    set status = coalesce(status, 'succeeded');

    alter table public.payment_records
      alter column status set default 'succeeded',
      alter column status set not null;

    create unique index if not exists payment_records_stripe_checkout_session_id_key
      on public.payment_records(stripe_checkout_session_id);

    create unique index if not exists payment_records_stripe_invoice_id_key
      on public.payment_records(stripe_invoice_id);

    create index if not exists idx_payment_records_subscription_id
      on public.payment_records(stripe_subscription_id);
  end if;
end
$$;

create table if not exists public.webhook_logs (
  id uuid default gen_random_uuid() primary key,
  payload jsonb not null,
  received_at timestamptz default now(),
  source text,
  created_at timestamptz default now()
);

do $$
begin
  if to_regclass('public.webhook_logs') is not null then
    alter table public.webhook_logs
      add column if not exists event_id text,
      add column if not exists event_type text,
      add column if not exists processing_status text default 'pending',
      add column if not exists processing_error text,
      add column if not exists processed_at timestamptz,
      add column if not exists user_id uuid,
      add column if not exists stripe_customer_id text,
      add column if not exists stripe_subscription_id text;

    update public.webhook_logs
    set processing_status = coalesce(processing_status, 'pending');

    alter table public.webhook_logs
      alter column processing_status set default 'pending',
      alter column processing_status set not null;

    create unique index if not exists webhook_logs_source_event_id_key
      on public.webhook_logs(source, event_id);

    create index if not exists idx_webhook_logs_status
      on public.webhook_logs(processing_status, received_at desc);
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'organizations'
      and column_name = 'owner_id'
  ) then
    with owner_roles as (
      select distinct on (organization_id)
        organization_id,
        user_id
      from public.user_roles
      where organization_id is not null
        and role = 'owner'::public.app_role
      order by organization_id, created_at nulls last, user_id
    )
    update public.organizations o
    set owner_id = owner_roles.user_id
    from owner_roles
    where o.id = owner_roles.organization_id
      and o.owner_id is null;
  end if;
end
$$;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.has_role(
  _user_id uuid,
  _role public.app_role,
  _org_id uuid default null
)
returns boolean
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
begin
  if _user_id is null then
    return false;
  end if;

  if (select auth.uid()) is distinct from _user_id then
    return false;
  end if;

  return exists (
    select 1
    from public.user_roles ur
    where ur.user_id = _user_id
      and ur.role = _role
      and (_org_id is null or ur.organization_id = _org_id)
  );
end;
$$;

create or replace function public.has_role(
  check_user_id uuid,
  check_role public.app_role
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select public.has_role(check_user_id, check_role, null::uuid);
$$;

create or replace function public.is_org_member(
  _user_id uuid,
  _org_id uuid
)
returns boolean
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
begin
  if _user_id is null or _org_id is null then
    return false;
  end if;

  if (select auth.uid()) is distinct from _user_id then
    return false;
  end if;

  return exists (
    select 1
    from public.organization_members om
    where om.user_id = _user_id
      and om.organization_id = _org_id
      and om.is_active = true
  );
end;
$$;

create or replace function public.deduct_ai_credits(
  p_user_id uuid,
  p_cost integer,
  p_reason text
)
returns table (success boolean, remaining integer)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current_balance integer;
begin
  if p_cost is null or p_cost <= 0 then
    raise exception 'Credit cost must be a positive integer'
      using errcode = '22023';
  end if;

  if p_reason is null or btrim(p_reason) = '' then
    raise exception 'Credit deduction reason is required'
      using errcode = '22023';
  end if;

  if (select auth.uid()) is distinct from p_user_id then
    raise exception 'Users may only deduct their own credits'
      using errcode = '42501';
  end if;

  select p.credits
  into current_balance
  from public.profiles p
  where p.id = p_user_id
  for update;

  if current_balance is null then
    return query select false, 0;
    return;
  end if;

  if current_balance < p_cost then
    return query select false, current_balance;
    return;
  end if;

  update public.profiles
  set credits = credits - p_cost,
      updated_at = now()
  where id = p_user_id;

  insert into public.ai_credits_ledger (user_id, delta, reason, balance_after)
  values (p_user_id, -p_cost, p_reason, current_balance - p_cost);

  return query select true, current_balance - p_cost;
end;
$$;

revoke all on function public.has_role(uuid, public.app_role, uuid) from public;
revoke all on function public.has_role(uuid, public.app_role) from public;
revoke all on function public.is_org_member(uuid, uuid) from public;
revoke all on function public.deduct_ai_credits(uuid, integer, text) from public;

grant execute on function public.has_role(uuid, public.app_role, uuid) to authenticated, service_role;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;
grant execute on function public.is_org_member(uuid, uuid) to authenticated, service_role;
grant execute on function public.deduct_ai_credits(uuid, integer, text) to authenticated, service_role;

alter table public.organization_members enable row level security;
alter table public.user_roles enable row level security;
alter table public.clients enable row level security;
alter table public.ai_chat_history enable row level security;
alter table public.ai_credits_ledger enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payment_records enable row level security;
alter table public.webhook_logs enable row level security;
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.organizations from anon, authenticated;
revoke all on table public.organization_members from anon, authenticated;
revoke all on table public.user_roles from anon, authenticated;
revoke all on table public.clients from anon, authenticated;
revoke all on table public.ai_chat_history from anon, authenticated;
revoke all on table public.ai_credits_ledger from anon, authenticated;
revoke all on table public.subscriptions from anon, authenticated;
revoke all on table public.payment_records from anon, authenticated;

grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update on table public.organizations to authenticated;
grant select, insert, update, delete on table public.organization_members to authenticated;
grant select, insert, update, delete on table public.user_roles to authenticated;
grant select, insert, update, delete on table public.clients to authenticated;
grant select, insert, update, delete on table public.ai_chat_history to authenticated;
grant select on table public.ai_credits_ledger to authenticated;
grant select on table public.subscriptions to authenticated;
grant select on table public.payment_records to authenticated;

revoke all on table public.webhook_logs from anon, authenticated;

drop policy if exists "Members can view their org" on public.organizations;
drop policy if exists "Owners can update org" on public.organizations;
drop policy if exists "Authenticated users can create org" on public.organizations;

create policy "Org owners and members can view organizations"
  on public.organizations
  for select
  to authenticated
  using (
    owner_id = auth.uid()
    or public.is_org_member(auth.uid(), id)
  );

create policy "Authenticated users can create owned organizations"
  on public.organizations
  for insert
  to authenticated
  with check (
    auth.uid() is not null
    and owner_id = auth.uid()
  );

create policy "Organization owners can update organizations"
  on public.organizations
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "Members can view org members" on public.organization_members;
drop policy if exists "Admins can manage members" on public.organization_members;

create policy "Organization members can view memberships"
  on public.organization_members
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.organizations o
      where o.id = organization_members.organization_id
        and o.owner_id = auth.uid()
    )
    or public.is_org_member(auth.uid(), organization_id)
  );

create policy "Owners and admins can insert memberships"
  on public.organization_members
  for insert
  to authenticated
  with check (
    (
      user_id = auth.uid()
      and exists (
        select 1
        from public.organizations o
        where o.id = organization_id
          and o.owner_id = auth.uid()
      )
    )
    or public.has_role(auth.uid(), 'owner'::public.app_role, organization_id)
    or public.has_role(auth.uid(), 'admin'::public.app_role, organization_id)
  );

create policy "Owners and admins can update memberships"
  on public.organization_members
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.organizations o
      where o.id = organization_members.organization_id
        and o.owner_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'owner'::public.app_role, organization_id)
    or public.has_role(auth.uid(), 'admin'::public.app_role, organization_id)
  )
  with check (
    exists (
      select 1
      from public.organizations o
      where o.id = organization_members.organization_id
        and o.owner_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'owner'::public.app_role, organization_id)
    or public.has_role(auth.uid(), 'admin'::public.app_role, organization_id)
  );

create policy "Owners and admins can delete memberships"
  on public.organization_members
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.organizations o
      where o.id = organization_members.organization_id
        and o.owner_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'owner'::public.app_role, organization_id)
    or public.has_role(auth.uid(), 'admin'::public.app_role, organization_id)
  );

drop policy if exists "Users can view own roles" on public.user_roles;
drop policy if exists "Owners can manage roles" on public.user_roles;

create policy "Users can view own roles"
  on public.user_roles
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Owners can insert organization roles"
  on public.user_roles
  for insert
  to authenticated
  with check (
    (
      user_id = auth.uid()
      and role = 'owner'::public.app_role
      and organization_id is not null
      and exists (
        select 1
        from public.organizations o
        where o.id = organization_id
          and o.owner_id = auth.uid()
      )
    )
    or public.has_role(auth.uid(), 'owner'::public.app_role, organization_id)
  );

create policy "Owners can update organization roles"
  on public.user_roles
  for update
  to authenticated
  using (public.has_role(auth.uid(), 'owner'::public.app_role, organization_id))
  with check (public.has_role(auth.uid(), 'owner'::public.app_role, organization_id));

create policy "Owners can delete organization roles"
  on public.user_roles
  for delete
  to authenticated
  using (public.has_role(auth.uid(), 'owner'::public.app_role, organization_id));

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'ai_chat_history'
      and policyname = 'Users can manage own chat history'
  ) then
    create policy "Users can manage own chat history"
      on public.ai_chat_history
      for all
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'ai_credits_ledger'
      and policyname = 'Users can view own credit ledger'
  ) then
    create policy "Users can view own credit ledger"
      on public.ai_credits_ledger
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'subscriptions'
      and policyname = 'Users can view own subscriptions'
  ) then
    create policy "Users can view own subscriptions"
      on public.subscriptions
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'payment_records'
      and policyname = 'Users can view own payment records'
  ) then
    create policy "Users can view own payment records"
      on public.payment_records
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
end
$$;

drop policy if exists "Authenticated users can read webhook logs" on public.webhook_logs;