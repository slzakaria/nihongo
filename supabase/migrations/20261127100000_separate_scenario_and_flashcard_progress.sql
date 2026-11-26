-- Scenario phrase exploration and flashcard reviews are different progress streams.
-- Existing SRS rows mixed both activities and cannot be reliably classified, so clear
-- them once before recording new flashcard-only progress.
do $$
begin
  if to_regclass('public.scenario_phrase_progress') is null then
    delete from public.srs_cards;
  end if;
end $$;

-- The client upserts one SRS card per user and phrase; make that conflict target real.
create unique index if not exists srs_cards_user_phrase_key
  on public.srs_cards (user_id, phrase_id);

create table if not exists public.scenario_phrase_progress (
  user_id text not null,
  phrase_id text not null,
  scenario_slug text not null,
  explored_at timestamptz not null default now(),
  primary key (user_id, phrase_id)
);

create index if not exists scenario_phrase_progress_user_scenario_idx
  on public.scenario_phrase_progress (user_id, scenario_slug);

alter table public.scenario_phrase_progress enable row level security;

revoke all on public.scenario_phrase_progress from public, anon, authenticated;
grant select, insert, update, delete
  on public.scenario_phrase_progress to authenticated;
grant all on public.scenario_phrase_progress to service_role;

drop policy if exists "Own scenario phrase progress"
  on public.scenario_phrase_progress;
create policy "Own scenario phrase progress"
  on public.scenario_phrase_progress
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
