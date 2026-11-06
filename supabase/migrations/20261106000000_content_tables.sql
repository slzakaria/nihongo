-- Phrase and kana content, one row per scenario group.
-- The phrases for each group are stored as jsonb, matching the JSON file shape.
-- Public (anon and authenticated) can read. Only the service role can write,
-- because it bypasses RLS and no write policies are defined.

create table if not exists public.phrase_scenarios (
  slug text primary key,
  label text not null,
  icon text not null default '',
  sort_order integer not null,
  phrases jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.hiragana_rows (
  slug text primary key,
  label text not null,
  icon text not null default '',
  sort_order integer not null,
  phrases jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.katakana_rows (
  slug text primary key,
  label text not null,
  icon text not null default '',
  sort_order integer not null,
  phrases jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.phrase_scenarios enable row level security;
alter table public.hiragana_rows enable row level security;
alter table public.katakana_rows enable row level security;

create policy "Public can read phrase scenarios"
  on public.phrase_scenarios for select
  to anon, authenticated
  using (true);

create policy "Public can read hiragana rows"
  on public.hiragana_rows for select
  to anon, authenticated
  using (true);

create policy "Public can read katakana rows"
  on public.katakana_rows for select
  to anon, authenticated
  using (true);
