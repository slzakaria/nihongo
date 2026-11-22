// Streak-freeze date comparison — the actual date is now synced to Supabase (profiles.streak_freeze_until,
// see store/streak.ts) rather than kept here, but this pure calculation stays colocated with the
// streak logic it adjusts.

// While an active freeze covers today and nothing has been studied yet today, pins the streak
// calculation to the last real study day instead of today — so the gap doesn't reset the streak.
// Once the freeze window passes, or the person studies again, this has no effect.
export function effectiveToday(
  days: string[],
  today: string,
  freezeUntil: string | null,
): string {
  if (!freezeUntil || freezeUntil < today || days.includes(today)) return today;
  const mostRecent = [...days].sort().at(-1);
  return mostRecent ?? today;
}
