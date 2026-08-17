create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free','premium','pro','enterprise','document')),
  credits integer not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive' check (status in ('inactive','trialing','active','past_due','canceled','unpaid')),
  tier text not null default 'free' check (tier in ('free','premium','pro','enterprise','document')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ai_credits_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  delta integer not null,
  reason text not null,
  balance_after integer not null,
  created_at timestamptz not null default now()
);

create table if not exists legal_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  case_type text,
  status text not null default 'open' check (status in ('open','in_progress','pending','closed')),
  description text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists legal_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id uuid references legal_cases(id) on delete set null,
  title text not null,
  document_type text not null,
  content text,
  status text not null default 'draft' check (status in ('draft','generated','reviewed','signed','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  event_name text,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_subscription_tier on profiles(subscription_tier);
create index if not exists idx_subscriptions_user_id on subscriptions(user_id);
create index if not exists idx_subscriptions_status on subscriptions(status);
create index if not exists idx_ai_credits_ledger_user_id on ai_credits_ledger(user_id, created_at desc);
create index if not exists idx_legal_cases_user_id on legal_cases(user_id, created_at desc);
create index if not exists idx_legal_documents_user_id on legal_documents(user_id, created_at desc);
create index if not exists idx_app_logs_user_id on app_logs(user_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, subscription_tier, credits)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_metadata ->> 'full_name', new.email),
    'free',
    50
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.deduct_ai_credits(p_user_id uuid, p_cost integer, p_reason text)
returns table (success boolean, remaining integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_balance integer;
begin
  select credits into current_balance
  from public.profiles
  where id = p_user_id
  for update;

  if current_balance is null then
    return query select false, 0;
  end if;

  if current_balance < p_cost then
    return query select false, current_balance;
  end if;

  update public.profiles
  set credits = credits - p_cost,
      updated_at = now()
  where id = p_user_id;

  insert into public.ai_credits_ledger (user_id, delta, reason, balance_after)
  values (p_user_id, -p_cost, p_reason, (current_balance - p_cost));

  return query select true, (current_balance - p_cost);
end;
$$;

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.ai_credits_ledger enable row level security;
alter table public.legal_cases enable row level security;
alter table public.legal_documents enable row level security;
alter table public.app_logs enable row level security;

create policy "Users can view own profile" on public.profiles
for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can view own subscriptions" on public.subscriptions
for select using (auth.uid() = user_id);

create policy "Users can insert own subscription" on public.subscriptions
for insert with check (auth.uid() = user_id);

create policy "Users can update own subscription" on public.subscriptions
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can view own credit ledger" on public.ai_credits_ledger
for select using (auth.uid() = user_id);

create policy "Users can view own cases" on public.legal_cases
for select using (auth.uid() = user_id);

create policy "Users can insert own cases" on public.legal_cases
for insert with check (auth.uid() = user_id);

create policy "Users can update own cases" on public.legal_cases
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can view own documents" on public.legal_documents
for select using (auth.uid() = user_id);

create policy "Users can insert own documents" on public.legal_documents
for insert with check (auth.uid() = user_id);

create policy "Users can update own documents" on public.legal_documents
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can view own logs" on public.app_logs
for select using (auth.uid() = user_id);

create policy "Users can insert own logs" on public.app_logs
for insert with check (auth.uid() = user_id);
