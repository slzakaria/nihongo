// Calendar day in the user's local timezone, as YYYY-MM-DD
export function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const DAY_MS = 24 * 60 * 60 * 1000

function previousDay(day: string): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) - DAY_MS).toISOString().slice(0, 10)
}

// Total distinct study days, and the current streak. The streak can still count if the last study day was yesterday.
export function computeStudyStats(days: string[], today: string) {
  const set = new Set(days)
  const total = set.size

  let cursor = set.has(today) ? today : previousDay(today)
  let streak = 0
  while (set.has(cursor)) {
    streak++
    cursor = previousDay(cursor)
  }

  return { total, streak }
}
