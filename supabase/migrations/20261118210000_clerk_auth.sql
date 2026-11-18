-- Move row-level security from Supabase logins (auth.uid()) to Clerk.
-- The Clerk token's `db_id` claim carries the database ID: the former Supabase user ID, or the Clerk ID for new users.
-- Existing rows keep their user_id values, so progress is untouched.
-- Run only after the Clerk "supabase" JWT template (with db_id) and the Supabase third-party auth connection are in place.

-- 1. Drop foreign keys that point at auth.users. Clerk users are not stored there.
do $$
declare r record;
begin
  for r in
    select c.conrelid::regclass as tbl, c.conname
    from pg_constraint c
    where c.contype = 'f' and c.confrelid = 'auth.users'::regclass and c.connamespace = 'public'::regnamespace
  loop
    execute format('alter table %s drop constraint %I', r.tbl, r.conname);
  end loop;
end $$;

-- 2. Drop the existing policies on these tables first. Postgres won't change a column's type while a policy uses it.
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('srs_cards', 'study_activity', 'simulator_conversations', 'profiles', 'push_subscriptions')
  loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- 3. Store user IDs as text, so Clerk IDs fit next to existing Supabase UUIDs.
alter table public.srs_cards alter column user_id type text using user_id::text;
alter table public.study_activity alter column user_id type text using user_id::text;
alter table public.simulator_conversations alter column user_id type text using user_id::text;
alter table public.profiles alter column id type text using id::text;
alter table public.push_subscriptions alter column user_id type text using user_id::text;

-- 4. Replace the old policies with ones that check the Clerk token's db_id claim.
alter table public.srs_cards enable row level security;
alter table public.study_activity enable row level security;
alter table public.simulator_conversations enable row level security;
alter table public.profiles enable row level security;
alter table public.push_subscriptions enable row level security;

create policy "Own push subscriptions" on public.push_subscriptions
  for all to authenticated
  using ((select auth.jwt()->>'db_id') = user_id)
  with check ((select auth.jwt()->>'db_id') = user_id);

create policy "Own progress cards" on public.srs_cards
  for all to authenticated
  using ((select auth.jwt()->>'db_id') = user_id)
  with check ((select auth.jwt()->>'db_id') = user_id);

create policy "Own study days" on public.study_activity
  for all to authenticated
  using ((select auth.jwt()->>'db_id') = user_id)
  with check ((select auth.jwt()->>'db_id') = user_id);

create policy "Own simulator conversations" on public.simulator_conversations
  for all to authenticated
  using ((select auth.jwt()->>'db_id') = user_id)
  with check ((select auth.jwt()->>'db_id') = user_id);

create policy "Own profile" on public.profiles
  for all to authenticated
  using ((select auth.jwt()->>'db_id') = id)
  with check ((select auth.jwt()->>'db_id') = id);

-- 5. Avatars: each user writes only inside their own folder
drop policy if exists "Users upload their own avatar" on storage.objects;
create policy "Users upload their own avatar" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.jwt()->>'db_id'));

drop policy if exists "Users update their own avatar" on storage.objects;
create policy "Users update their own avatar" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.jwt()->>'db_id'));
