-- Free-question limit for LegallyAI chat (anonymous + non-subscribers).
create table if not exists public.ai_question_usage (
  subject text primary key,            -- 'user:<uuid>' or 'ip:<sha256>' (no raw IPs)
  questions integer not null default 0,
  first_at timestamptz not null default now(),
  last_at timestamptz not null default now()
);
alter table public.ai_question_usage enable row level security;
-- No RLS policies: only the service role (edge functions) can read or write.

create or replace function public.consume_free_question(p_subject text, p_limit integer)
returns table(allowed boolean, used integer)
language plpgsql
security definer
set search_path = public
as $$
declare v integer;
begin
  insert into public.ai_question_usage as u (subject, questions)
  values (p_subject, 1)
  on conflict (subject) do update
    set questions = u.questions + 1, last_at = now()
    where u.questions < p_limit
  returning u.questions into v;
  if v is null then
    select u.questions into v from public.ai_question_usage u where u.subject = p_subject;
    return query select false, coalesce(v, p_limit);
  else
    return query select true, v;
  end if;
end;
$$;
revoke all on function public.consume_free_question(text, integer) from public, anon, authenticated;
grant execute on function public.consume_free_question(text, integer) to service_role;
