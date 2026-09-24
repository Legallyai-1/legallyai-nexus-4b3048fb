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
  else
    alter type public.app_role add value if not exists 'owner';
    alter type public.app_role add value if not exists 'admin';
    alter type public.app_role add value if not exists 'manager';
    alter type public.app_role add value if not exists 'lawyer';
    alter type public.app_role add value if not exists 'paralegal';
    alter type public.app_role add value if not exists 'employee';
    alter type public.app_role add value if not exists 'client';
  end if;
end
$$;
