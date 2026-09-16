with ranked_subscriptions as (
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
  from ranked_subscriptions
  where row_number > 1
);

create unique index if not exists subscriptions_user_id_key
  on public.subscriptions(user_id);