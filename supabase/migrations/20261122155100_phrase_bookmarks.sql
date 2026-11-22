-- Per-user saved phrases; Clerk's db_id claim scopes access through RLS.
create table if not exists public.phrase_bookmarks (
  user_id text not null,
  phrase_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, phrase_id)
);

alter table public.phrase_bookmarks enable row level security;

drop policy if exists "Own phrase bookmarks" on public.phrase_bookmarks;
create policy "Own phrase bookmarks" on public.phrase_bookmarks
  for all to authenticated
  using ((select auth.jwt()->>'db_id') = user_id)
  with check ((select auth.jwt()->>'db_id') = user_id);
