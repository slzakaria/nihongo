'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useProgressStore } from '@/store/progress';
import { useContentStore } from '@/lib/data/content';
import { useBadgesStore } from '@/store/badges';
import { fetchStudyDays } from '@/lib/supabase/activity';
import { fetchConversationSummaries } from '@/lib/supabase/simulator';
import { dayKey } from '@/lib/activity/studyDays';
import { computeBadgeStats, getBadge, unlockedBadgeIds } from '@/lib/badges';

// Lazily loaded so confetti never ships in the initial bundle for people who never earn a badge.
// Origin sits just above the toast (fixed bottom-6, i.e. near the very bottom of the viewport) so
// the burst visibly comes from the toast instead of popping up mid-screen.
function fireConfetti(particleCount: number) {
  void import('canvas-confetti').then(({ default: confetti }) =>
    confetti({ particleCount, spread: 100, origin: { x: 0.5, y: 0.92 } }),
  );
}

// Watches every badge category (flashcards, kana, streak, days learning, scenario exploration,
// simulator conversations) and celebrates each one — once, ever — with a toast and a confetti burst. Shown
// one at a time from a small queue, since reviewing a single phrase can sometimes cross more than
// one threshold at once (e.g. a phrase count milestone and a scenario completion together).
export function MilestoneWatcher() {
  const user = useAuthStore((s) => s.user);
  const cards = useProgressStore((s) => s.cards);
  const scenarioProgress = useProgressStore((s) => s.scenarioProgress ?? {});
  const scenarios = useContentStore((s) => s.content.phrases);
  const celebrated = useBadgesStore((s) => s.celebrated);
  const pendingCelebrations = useBadgesStore((s) => s.pendingCelebrations);
  const enqueueCelebrations = useBadgesStore((s) => s.enqueueCelebrations);
  const dequeueCelebration = useBadgesStore((s) => s.dequeueCelebration);

  const [studyDays, setStudyDays] = useState<string[] | null>(null);
  const [conversationCount, setConversationCount] = useState<number | null>(null);

  const userId = user?.id ?? null;

  useEffect(() => {
    if (!userId) return;
    void fetchStudyDays(userId).then(setStudyDays);
    void fetchConversationSummaries(userId).then((list) =>
      setConversationCount(list.length),
    );
  }, [userId]);

  useEffect(() => {
    if (!userId || studyDays === null || conversationCount === null) return;
    const stats = computeBadgeStats({
      cards: Object.values(cards),
      scenarioProgress,
      scenarios,
      studyDays,
      conversationCount,
      today: dayKey(),
    });
    const newlyUnlocked = unlockedBadgeIds(stats).filter((id) => !celebrated[id]);
    if (newlyUnlocked.length === 0) return;
    if (!enqueueCelebrations(newlyUnlocked)) return;
    // One burst per batch of newly-unlocked badges, not one per toast — several badges can
    // unlock at once and are shown one at a time, which would otherwise fire repeatedly.
    fireConfetti(220);
  }, [
    userId,
    cards,
    scenarioProgress,
    scenarios,
    studyDays,
    conversationCount,
    celebrated,
    enqueueCelebrations,
  ]);

  useEffect(() => {
    if (pendingCelebrations.length === 0) return;
    const timer = setTimeout(dequeueCelebration, 3000);
    return () => clearTimeout(timer);
  }, [dequeueCelebration, pendingCelebrations]);

  const current = pendingCelebrations[0] ?? null;

  if (!current) return null;
  const badge = getBadge(current);
  if (!badge) return null;

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
  );
}
