export const REVISIT_AFTER_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

// Describes when a simulator conversation was last practised, and whether it is time to revisit it
export function revisitInfo(
  updatedAt: string | undefined,
  now: number,
): { due: boolean; label: string } {
  if (!updatedAt) return { due: false, label: "Not started yet" };
  const days = Math.floor((now - Date.parse(updatedAt)) / DAY_MS);
  if (days >= REVISIT_AFTER_DAYS)
    return {
      due: true,
      label: `Time to revisit · last practised ${days} days ago`,
    };
  if (days <= 0) return { due: false, label: "Practised today" };
  return {
    due: false,
    label: `Practised ${days} ${days === 1 ? "day" : "days"} ago`,
  };
}
