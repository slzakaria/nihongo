-- Track total completed flashcard reviews per card, for the admin dashboard.
-- Unlike `repetitions` (SM-2's consecutive-success streak, which resets to 0 on a failed grade),
-- `total_reviews` counts every graded review ever, pass or fail, and never resets.

alter table public.srs_cards add column if not exists total_reviews integer not null default 0;

-- Backfill: we can't recover historical review counts, so seed it from whether the card has
-- been reviewed at least once (repetitions already reflects at least one pass for cards with a
-- non-zero streak; cards with last_review set but repetitions = 0 have failed at least once).
update public.srs_cards
set total_reviews = greatest(repetitions, case when last_review is not null then 1 else 0 end)
where total_reviews = 0;
