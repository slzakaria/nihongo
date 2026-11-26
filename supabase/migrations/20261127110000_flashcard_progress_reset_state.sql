create table if not exists public.flashcard_progress_state (
  id smallint primary key check (id = 1),
  reset_version bigint not null default 0 check (reset_version >= 0),
  reset_at timestamptz not null default 'epoch'::timestamptz
);

insert into public.flashcard_progress_state (id)
values (1)
on conflict (id) do nothing;

alter table public.flashcard_progress_state enable row level security;

revoke all on public.flashcard_progress_state from public, anon, authenticated;
grant select on public.flashcard_progress_state to authenticated;
grant all on public.flashcard_progress_state to service_role;

drop policy if exists "Authenticated can read flashcard progress reset state"
  on public.flashcard_progress_state;
create policy "Authenticated can read flashcard progress reset state"
  on public.flashcard_progress_state
  for select to authenticated
  using (true);
