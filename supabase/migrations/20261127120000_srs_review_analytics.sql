create table if not exists public.srs_review_events (
  id text primary key,
  user_id text not null,
  phrase_id text not null,
  scenario_slug text not null,
  rating text not null check (rating in ('again', 'hard', 'good', 'easy')),
  reviewed_at timestamptz not null
);

create index if not exists srs_review_events_user_reviewed_at_idx
  on public.srs_review_events (user_id, reviewed_at desc);

alter table public.srs_review_events enable row level security;

revoke all on public.srs_review_events from public, anon, authenticated;
grant select, insert, update on public.srs_review_events to authenticated;
grant all on public.srs_review_events to service_role;

drop policy if exists "Own SRS review events" on public.srs_review_events;
create policy "Own SRS review events"
  on public.srs_review_events
  for all to authenticated
  using ((select auth.jwt()->>'db_id') = user_id)
  with check ((select auth.jwt()->>'db_id') = user_id);

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
  delete from public.srs_review_events where user_id = p_user_id;
  delete from public.scenario_phrase_progress where user_id = p_user_id;
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
