-- Tracks whether a person has seen the feature tour after signing in. Existing users start at false, so they see it once too.
alter table public.profiles add column if not exists feature_tour_seen boolean not null default false;
