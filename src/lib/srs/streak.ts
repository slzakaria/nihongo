import { SRSCard } from "@/types";

function dateKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// Counts consecutive days (ending today or yesterday) with at least one reviewed card.
// A day without any review doesn't break the streak until a full day is missed.
export function computeStreak(cards: SRSCard[], now = Date.now()): number {
  const reviewedDays = new Set(
    cards
      .filter((c) => c.lastReview !== null)
      .map((c) => dateKey(c.lastReview as number)),
  );

  const cursor = new Date(now);
  if (!reviewedDays.has(dateKey(cursor.getTime()))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (reviewedDays.has(dateKey(cursor.getTime()))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
