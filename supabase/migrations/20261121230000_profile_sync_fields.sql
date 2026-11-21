-- Syncs weekly goal, streak freeze and celebrated badges across devices (previously local-only).
alter table public.profiles add column if not exists weekly_goal integer not null default 50;
alter table public.profiles add column if not exists streak_freeze_until date;
alter table public.profiles add column if not exists celebrated_badges text[] not null default '{}';
