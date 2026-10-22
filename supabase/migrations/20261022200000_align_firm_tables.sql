-- Align appointments, invoices, messages, and cases with what the app expects.
-- Adds missing columns, foreign keys to clients, updated_at triggers, and
-- organization-scoped access through organization_members.

-- appointments ---------------------------------------------------------------
alter table public.appointments
  add column if not exists title text,
  add column if not exists client_id uuid references public.clients(id) on delete set null,
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade,
  add column if not exists status text not null default 'scheduled',
  add column if not exists is_virtual boolean not null default false,
  add column if not exists is_free boolean not null default true,
  add column if not exists fee numeric,
  add column if not exists location text,
  add column if not exists meeting_link text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();
alter table public.appointments alter column user_id set default auth.uid();
update public.appointments set organization_id = org_id where organization_id is null and org_id is not null;

-- invoices --------------------------------------------------------------------
alter table public.invoices
  add column if not exists invoice_number text,
  add column if not exists client_id uuid references public.clients(id) on delete set null,
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade,
  add column if not exists status text not null default 'pending',
  add column if not exists items jsonb not null default '[]'::jsonb,
  add column if not exists notes text,
  add column if not exists due_date date,
  add column if not exists paid_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();
alter table public.invoices alter column user_id set default auth.uid();
update public.invoices set status = 'paid' where paid is true and status = 'pending';
update public.invoices set organization_id = org_id where organization_id is null and org_id is not null;

-- messages --------------------------------------------------------------------
alter table public.messages
  add column if not exists sender_id uuid references auth.users(id) on delete cascade,
  add column if not exists recipient_id uuid references auth.users(id) on delete cascade,
  add column if not exists is_read boolean not null default false,
  add column if not exists created_at timestamptz not null default now();
update public.messages set sender_id = user_id where sender_id is null;
update public.messages set created_at = sent_at where sent_at is not null and created_at > sent_at;
alter table public.messages alter column user_id set default auth.uid();
alter table public.messages alter column sender_id set default auth.uid();
create index if not exists messages_sender_recipient_idx on public.messages (sender_id, recipient_id, created_at);

-- cases -----------------------------------------------------------------------
alter table public.cases
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists priority text not null default 'medium',
  add column if not exists next_deadline timestamptz,
  add column if not exists hub_type text;
alter table public.cases alter column user_id set default auth.uid();
alter table public.cases alter column status set default 'active';
update public.cases set organization_id = org_id where organization_id is null and org_id is not null;

-- updated_at trigger ----------------------------------------------------------
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
do $$ declare t text;
begin
  foreach t in array array['appointments','invoices','cases','clients'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- organization access policies ------------------------------------------------
create or replace function public.is_org_member(p_org uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select p_org is not null and exists (
    select 1 from public.organization_members m where m.organization_id = p_org and m.user_id = auth.uid()
  );
$$;
grant execute on function public.is_org_member(uuid) to authenticated;

do $$ declare t text;
begin
  foreach t in array array['appointments','invoices','messages','cases'] loop
    execute format('drop policy if exists %I on public.%I', t||'_org_select', t);
    execute format('drop policy if exists %I on public.%I', t||'_org_modify', t);
  end loop;
end $$;

create policy appointments_org_select on public.appointments for select to authenticated
  using (user_id = auth.uid() or public.is_org_member(organization_id));
create policy appointments_org_modify on public.appointments for all to authenticated
  using (user_id = auth.uid() or public.is_org_member(organization_id))
  with check (user_id = auth.uid() or public.is_org_member(organization_id));

create policy invoices_org_select on public.invoices for select to authenticated
  using (user_id = auth.uid() or public.is_org_member(organization_id));
create policy invoices_org_modify on public.invoices for all to authenticated
  using (user_id = auth.uid() or public.is_org_member(organization_id))
  with check (user_id = auth.uid() or public.is_org_member(organization_id));

create policy cases_org_select on public.cases for select to authenticated
  using (user_id = auth.uid() or public.is_org_member(organization_id) or assigned_lawyer_id = auth.uid());
create policy cases_org_modify on public.cases for all to authenticated
  using (user_id = auth.uid() or public.is_org_member(organization_id))
  with check (user_id = auth.uid() or public.is_org_member(organization_id));

create policy messages_org_select on public.messages for select to authenticated
  using (sender_id = auth.uid() or recipient_id = auth.uid() or user_id = auth.uid());
create policy messages_org_modify on public.messages for all to authenticated
  using (sender_id = auth.uid() or recipient_id = auth.uid() or user_id = auth.uid())
  with check (sender_id = auth.uid() or user_id = auth.uid());

-- Clients: members of the organization can view their organization's clients.
drop policy if exists clients_org_member_select on public.clients;
create policy clients_org_member_select on public.clients for select to authenticated
  using (user_id = auth.uid() or public.is_org_member(organization_id));
drop policy if exists clients_org_member_insert on public.clients;
create policy clients_org_member_insert on public.clients for insert to authenticated
  with check (public.is_org_member(organization_id));

notify pgrst, 'reload schema';
