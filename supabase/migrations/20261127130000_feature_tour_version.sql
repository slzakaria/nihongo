-- Version the tour independently from the legacy profile intro and daily recap flags.
alter table public.profiles
  add column if not exists feature_tour_version integer not null default 0;