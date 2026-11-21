'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { useProgressStore } from '@/store/progress'
import { useContentStore } from '@/lib/data/content'
import { useBadgesStore } from '@/store/badges'
import { fetchStudyDays } from '@/lib/supabase/activity'
import { fetchConversationSummaries } from '@/lib/supabase/simulator'
import { dayKey } from '@/lib/activity/studyDays'
import { computeBadgeStats, getBadge, unlockedBadgeIds } from '@/lib/badges'

// Lazily loaded so confetti never ships in the initial bundle for people who never earn a badge
function fireConfetti(particleCount: number) {
  void import('canvas-confetti').then(({ default: confetti }) =>
    confetti({ particleCount, spread: 100, origin: { y: 0.6 } })
  )
}

// Watches every badge category (phrases, streak, days learning, scenarios completed, simulator
// conversations) and celebrates each one — once, ever — with a toast and a confetti burst. Shown
// one at a time from a small queue, since reviewing a single phrase can sometimes cross more than
// one threshold at once (e.g. a phrase count milestone and a scenario completion together).
export function MilestoneWatcher() {
  const user = useAuthStore(s => s.user)
  const cards = useProgressStore(s => s.cards)
  const scenarios = useContentStore(s => s.content.phrases)
  const celebrated = useBadgesStore(s => s.celebrated)
  const markCelebrated = useBadgesStore(s => s.markCelebrated)

  const [studyDays, setStudyDays] = useState<string[] | null>(null)
  const [conversationCount, setConversationCount] = useState<number | null>(null)
  const [queue, setQueue] = useState<string[]>([])
  const [current, setCurrent] = useState<string | null>(null)

  const userId = user?.id ?? null

  useEffect(() => {
    if (!userId) return
    void fetchStudyDays(userId).then(setStudyDays)
    void fetchConversationSummaries(userId).then(list => setConversationCount(list.length))
  }, [userId])

  useEffect(() => {
    if (!userId || studyDays === null || conversationCount === null) return
    const stats = computeBadgeStats({
      cards: Object.values(cards),
      scenarios,
      studyDays,
      conversationCount,
      today: dayKey(),
    })
    const newlyUnlocked = unlockedBadgeIds(stats).filter(id => !celebrated[id])
    if (newlyUnlocked.length === 0) return
    for (const id of newlyUnlocked) markCelebrated(id)
    setQueue(q => [...q, ...newlyUnlocked.filter(id => !q.includes(id))])
    // Only re-run when the underlying data actually changes, not on every celebrated/queue update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, cards, scenarios, studyDays, conversationCount])

  useEffect(() => {
    if (current || queue.length === 0) return
    const [next, ...rest] = queue
    setQueue(rest)
    setCurrent(next)
    fireConfetti(220)
    const timer = setTimeout(() => setCurrent(null), 4500)
    return () => clearTimeout(timer)
  }, [queue, current])

  if (!current) return null
  const badge = getBadge(current)
  if (!badge) return null

  return (
    <div
      role="status"
      className="animate-scale-in fixed bottom-6 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg"
    >
      <span className="text-2xl" aria-hidden="true">
        🏅
      </span>
      <div>
        <p className="text-sm font-semibold">{badge.label} unlocked!</p>
        <p className="text-xs text-muted-foreground">{badge.description}</p>
      </div>
    </div>
  )
}
