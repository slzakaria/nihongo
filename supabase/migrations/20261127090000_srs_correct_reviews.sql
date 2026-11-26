-- Track how many graded reviews actually passed (grade >= 3), for accuracy stats —
-- e.g. the new kana multiple-choice quiz. Unlike `repetitions` (which resets to 0 on
-- a failed grade), `correct_reviews` counts every passing review ever and never resets,
-- matching the `total_reviews` pattern already used for completion counts.

alter table public.srs_cards add column if not exists correct_reviews integer not null default 0;

-- Backfill: we can't recover historical pass/fail history, so seed a lower-bound
-- estimate from the current streak (`repetitions` is itself a count of consecutive
-- passing reviews, so it's always <= the true correct count).
update public.srs_cards
set correct_reviews = repetitions
where correct_reviews = 0;
