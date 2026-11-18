-- Profile avatars and study-day tracking

-- 1. Avatar URL on the profile
alter table public.profiles add column if not exists avatar_url text;

-- 2. Public avatars bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 3. Anyone can read avatars; signed-in users can only write inside their own folder
drop policy if exists "Avatars are publicly readable" on storage.objects;
create policy "Avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users upload their own avatar" on storage.objects;
create policy "Users upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users update their own avatar" on storage.objects;
create policy "Users update their own avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- 4. One row per day a user studied
create table if not exists public.study_activity (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  primary key (user_id, day)
);

alter table public.study_activity enable row level security;

drop policy if exists "Users read their own study days" on public.study_activity;
create policy "Users read their own study days"
  on public.study_activity for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users add their own study days" on public.study_activity;
create policy "Users add their own study days"
  on public.study_activity for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 5. Optional backfill from existing review dates and simulator conversations
insert into public.study_activity (user_id, day)
select distinct user_id, last_review::date
from public.srs_cards
where last_review is not null
on conflict do nothing;

insert into public.study_activity (user_id, day)
select distinct user_id, updated_at::date
from public.simulator_conversations
on conflict do nothing;
