'use client';

import { useEffect, useState } from 'react';
import { Flame, CalendarCheck, BookOpenCheck, MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useOnboardingStore } from '@/store/onboarding';
import { useProgressStore } from '@/store/progress';
import { markInfoPopupShown, useInfoPopupCooldown } from '@/hooks/useInfoPopupCooldown';
import { getAllPhrases } from '@/lib/data/phrases';
import { countReviewedPhrases } from '@/lib/srs/milestones';
import { computeStudyStats, dayKey } from '@/lib/activity/studyDays';
import { fetchStudyDays } from '@/lib/supabase/activity';
import { fetchConversationSummaries } from '@/lib/supabase/simulator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SEEN_KEY_PREFIX = 'nihongo-recap-seen:';

// Lazily loaded so confetti never ships in the initial bundle for people who never see it fire
function fireConfetti(particleCount: number) {
  void import('canvas-confetti').then(({ default: confetti }) =>
    confetti({ particleCount, spread: 70, origin: { y: 0.6 } }),
  );
}

// A once-a-day recap of a signed-in person's streak, study activity and progress. Gated behind `synced`
// (always false on first render, both server and client, until the async profile fetch resolves)
// so there's no hydration mismatch even though it also reads localStorage synchronously.
export function DailyRecap() {
  const user = useAuthStore((s) => s.user);
  const synced = useOnboardingStore((s) => s.synced);
  const hasOnboarded = useOnboardingStore((s) => s.hasOnboarded);
  const featureTourSeen = useOnboardingStore((s) => s.featureTourSeen);
  const profileIntroSeen = useOnboardingStore((s) => s.profileIntroSeen);
  const userName = useOnboardingStore((s) => s.userName);
  const cards = useProgressStore((s) => s.cards);

  const [studyDays, setStudyDays] = useState<string[] | null>(null);
  const [conversationCount, setConversationCount] = useState<number | null>(null);
  const [closedNow, setClosedNow] = useState(false);
  const [index, setIndex] = useState(0);

  const userId = user?.id ?? null;
  const cooldownAvailable = useInfoPopupCooldown(userId ? 'device' : null);

  useEffect(() => {
    if (!userId) return;
    void fetchStudyDays(userId).then(setStudyDays);
    void fetchConversationSummaries(userId).then((list) =>
      setConversationCount(list.length),
    );
  }, [userId]);

  const today = dayKey();
  const seenKey = userId ? `${SEEN_KEY_PREFIX}${userId}` : null;
  const alreadyShownToday =
    typeof window !== 'undefined' && seenKey
      ? localStorage.getItem(seenKey) === today
      : true;

  const dataLoaded = studyDays !== null && conversationCount !== null;
  // Waits for the feature tour and profile intro so dialogs don't stack on a first sign-in
  const open =
    Boolean(user) &&
    synced &&
    hasOnboarded &&
    featureTourSeen &&
    profileIntroSeen &&
    dataLoaded &&
    !alreadyShownToday &&
    cooldownAvailable &&
    !closedNow;

  useEffect(() => {
    if (open) fireConfetti(35);
    // Fires once when the dialog first appears, not on every re-render while it's open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    if (seenKey) localStorage.setItem(seenKey, today);
    if (userId) markInfoPopupShown('device');
    setClosedNow(true);
  }

  if (!open) return null;

  const allCards = Object.values(cards);
  const totalPhrases = getAllPhrases().length;
  const reviewed = countReviewedPhrases(allCards);
  const pct = totalPhrases === 0 ? 0 : Math.round((reviewed / totalPhrases) * 100);
  const study = computeStudyStats(studyDays ?? [], today);
  const conversations = conversationCount ?? 0;

  const slides = [
    {
      icon: Flame,
      title: study.streak > 0 ? `${study.streak}-day streak` : 'Start a streak today',
      text:
        study.streak > 0
          ? `You've studied ${study.streak} day${study.streak === 1 ? '' : 's'} in a row. Keep it going!`
          : 'Review a phrase today to start a new streak.',
    },
    {
      icon: CalendarCheck,
      title: `${study.total} day${study.total === 1 ? '' : 's'} learning`,
      text: `You've shown up to study ${study.total} day${study.total === 1 ? '' : 's'} so far. Every session counts.`,
    },
    {
      icon: BookOpenCheck,
      title: `${reviewed} phrases practised`,
      text: `That's ${pct}% of everything in Hanazono — ${reviewed} of ${totalPhrases} phrases reviewed.`,
    },
    {
      icon: MessageSquare,
      title: `${conversations} conversation${conversations === 1 ? '' : 's'}`,
      text:
        conversations > 0
          ? `You've practised ${conversations} scenario${conversations === 1 ? '' : 's'} with the simulator.`
          : 'Try a live conversation with the simulator today.',
    },
  ];

  const slide = slides[index];
  const isLast = index === slides.length - 1;
  const Icon = slide.icon;

  function next() {
    if (isLast) {
      close();
      return;
    }
    setIndex((i) => i + 1);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="daily-recap-title"
        className="animate-scale-in w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-lg"
      >
        <div
          className="gradient-brand flex flex-col items-center gap-4 px-6 pb-4 pt-8 text-center"
          aria-live="polite"
        >
          <p lang="ja" className="text-sm font-medium">
            {userName ? `${userName} さん、おかえりなさい！` : 'おかえりなさい！'}
          </p>
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-card/80">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 id="daily-recap-title" className="text-xl font-semibold">
            {slide.title}
          </h2>
          <p className="min-h-14 text-sm text-muted-foreground">{slide.text}</p>
        </div>

        <div className="flex justify-center gap-1.5 pt-4" aria-hidden="true">
          {slides.map((s, i) => (
            <span
              key={s.title}
              className={cn(
                'h-1.5 w-1.5 rounded-full transition-colors',
                i === index ? 'bg-foreground' : 'bg-border',
              )}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 px-6 py-4">
          <Button variant="ghost" className="cursor-pointer" onClick={close}>
            Skip
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              disabled={index === 0}
              onClick={() => setIndex((i) => i - 1)}
            >
              Back
            </Button>
            <Button className="cursor-pointer" onClick={next}>
              {isLast ? 'Continue' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
