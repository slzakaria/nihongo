create table if not exists public.api_rate_limits (
  bucket text not null,
  identity_hash text not null,
  period date not null,
  request_count integer not null check (request_count > 0),
  updated_at timestamptz not null default now(),
  primary key (bucket, identity_hash)
);

alter table public.api_rate_limits enable row level security;
revoke all on public.api_rate_limits from public, anon, authenticated;
grant all on public.api_rate_limits to service_role;
create index if not exists api_rate_limits_period_idx
  on public.api_rate_limits (period);

create or replace function public.consume_api_daily_limit(
  p_bucket text,
  p_identity_hash text,
  p_limit integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_period date := (now() at time zone 'UTC')::date;
  current_count integer;
begin
  if p_bucket is null
    or p_bucket !~ '^[a-z0-9:_-]{1,80}$'
    or p_identity_hash !~ '^[0-9a-f]{64}$'
    or p_limit < 1
    or p_limit > 10000
  then
    raise exception 'Invalid rate-limit parameters';
  end if;

  delete from public.api_rate_limits
  where period < current_period - 7;

  insert into public.api_rate_limits (
    bucket,
    identity_hash,
    period,
    request_count
  )
  values (p_bucket, p_identity_hash, current_period, 1)
  on conflict (bucket, identity_hash) do update
  set
    period = excluded.period,
    request_count = case
      when public.api_rate_limits.period = excluded.period
        then least(public.api_rate_limits.request_count + 1, p_limit + 1)
      else 1
    end,
    updated_at = now()
  returning request_count into current_count;

  return current_count <= p_limit;
end;
$function$;

revoke all on function public.consume_api_daily_limit(text, text, integer)
  from public, anon, authenticated;
grant execute on function public.consume_api_daily_limit(text, text, integer)
  to service_role;

create or replace function public.delete_account_data(
  p_user_id text,
  p_rate_limit_identity_hash text
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if p_user_id is null or p_user_id = '' then
    raise exception 'User ID is required';
  end if;
  if p_rate_limit_identity_hash is not null
    and p_rate_limit_identity_hash !~ '^[0-9a-f]{64}$'
  then
    raise exception 'Invalid rate-limit identity';
  end if;

  if p_rate_limit_identity_hash is not null then
    delete from public.api_rate_limits
    where bucket in ('anthropic:user', 'elevenlabs:user')
      and identity_hash = p_rate_limit_identity_hash;
  end if;
  delete from public.srs_cards where user_id = p_user_id;
  delete from public.study_activity where user_id = p_user_id;
  delete from public.simulator_conversations where user_id = p_user_id;
  delete from public.phrase_bookmarks where user_id = p_user_id;
  delete from public.profiles where id = p_user_id;
end;
$function$;

revoke all on function public.delete_account_data(text, text)
  from public, anon, authenticated;
grant execute on function public.delete_account_data(text, text)
  to service_role;
