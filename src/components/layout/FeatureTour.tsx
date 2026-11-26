'use client';

import { useUser } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';
import {
  Award,
  BarChart3,
  BookOpen,
  Download,
  Layers,
  Mic,
  Route,
  Sparkles,
  type LucideIcon,
  UserRound,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { FEATURE_TOUR_VERSION, useOnboardingStore } from '@/store/onboarding';
import { markInfoPopupShown, useInfoPopupCooldown } from '@/hooks/useInfoPopupCooldown';
import { isAdminEmail } from '@/lib/admin';
import { Button } from '@/components/ui/button';
import { BilingualText } from '@/components/layout/BilingualText';
import { cn } from '@/lib/utils';

const GUEST_TOUR_COOKIE = `nihongo-feature-tour-seen-v${FEATURE_TOUR_VERSION}`;

const LEARNING_STEPS = [
  { icon: BookOpen, label: 'Scenarios' },
  { icon: Layers, label: 'Flashcards' },
  { icon: Mic, label: 'Simulator' },
];

const SLIDES: {
  icon: LucideIcon;
  title: string;
  text: string;
  learningFlow?: boolean;
}[] = [
  {
    icon: Sparkles,
    title: 'Welcome to Hanazono',
    text: 'Build practical Japanese skills with short lessons, phrase review, and speaking practice.',
  },
  {
    icon: Route,
    title: 'Your learning path',
    text: 'Explore a scenario, review its phrases with flashcards, then use them in a live simulator conversation. Completion prompts will guide you to the next step.',
    learningFlow: true,
  },
  {
    icon: BookOpen,
    title: 'Phrases for real situations',
    text: 'Browse travel scenarios, search phrases, and find quick etiquette notes. Choose whether romaji is shown.',
  },
  {
    icon: Layers,
    title: 'Review your way',
    text: 'Practise kana and phrases with spaced repetition. Bookmark useful phrases for a focused review queue.',
  },
  {
    icon: Mic,
    title: 'Speak and listen',
    text: 'Hear Japanese, practise speaking in a supported browser, or role-play a conversation with the simulator.',
  },
  {
    icon: Award,
    title: 'Build a steady habit',
    text: 'Set study goals, track your progress, and celebrate milestones with badges and a daily recap.',
  },
  {
    icon: UserRound,
    title: 'Your profile',
    text: 'Find your progress, saved phrases, conversations, and preferences together in one place.',
  },
  {
    icon: Download,
    title: 'Practice offline',
    text: 'Open Offline practice once while connected to cache phrase and kana practice. Your progress saves on this device and signed-in changes sync when you reconnect.',
  },
];

function guestTourWasSeen(): boolean {
  return document.cookie
    .split(';')
    .some((cookie) => cookie.trim() === `${GUEST_TOUR_COOKIE}=1`);
}

export function FeatureTour() {
  const { isLoaded, isSignedIn } = useUser();
  const user = useAuthStore((s) => s.user);
  const synced = useOnboardingStore((s) => s.synced);
  const hasOnboarded = useOnboardingStore((s) => s.hasOnboarded);
  const featureTourVersion = useOnboardingStore((s) => s.featureTourVersion);
  const markFeatureTourSeen = useOnboardingStore((s) => s.markFeatureTourSeen);
  const [tourProgress, setTourProgress] = useState<{
    scope: string | null;
    index: number;
  }>({ scope: null, index: 0 });
  const [guestDismissed, setGuestDismissed] = useState(false);
  const scope = isSignedIn
    ? user
      ? `user:${user.id}`
      : null
    : isLoaded
      ? 'guest'
      : null;
  const cooldownScope = scope ? `feature-tour-v${FEATURE_TOUR_VERSION}:${scope}` : null;
  const cooldownAvailable = useInfoPopupCooldown(cooldownScope);
  const index = tourProgress.scope === scope ? tourProgress.index : 0;
  const setIndex = (nextIndex: number) => setTourProgress({ scope, index: nextIndex });
  const guestTourSeen =
    isLoaded && !isSignedIn ? guestDismissed || guestTourWasSeen() : null;

  const eligible = Boolean(
    isLoaded &&
    cooldownAvailable &&
    (isSignedIn
      ? user && synced && hasOnboarded && featureTourVersion < FEATURE_TOUR_VERSION
      : !user && guestTourSeen === false),
  );
  const [delayElapsedFor, setDelayElapsedFor] = useState<string | null>(null);

  useEffect(() => {
    if (!eligible || !scope) return;
    const timer = window.setTimeout(() => setDelayElapsedFor(scope), 3_000);
    return () => window.clearTimeout(timer);
  }, [eligible, scope]);

  const finishTour = useCallback(() => {
    if (!scope || !cooldownScope) return;
    markInfoPopupShown(cooldownScope);
    markInfoPopupShown('device');
    if (isSignedIn) {
      markFeatureTourSeen();
    } else {
      document.cookie = `${GUEST_TOUR_COOKIE}=1; max-age=31536000; path=/; samesite=lax`;
      setGuestDismissed(true);
    }
  }, [cooldownScope, isSignedIn, markFeatureTourSeen, scope]);

  const open = eligible && delayElapsedFor === scope;
  const slides =
    user && isAdminEmail(user.email)
      ? [
          ...SLIDES,
          {
            icon: BarChart3,
            title: 'Admin overview',
            text: 'Open your profile’s admin section to review registered users, recent activity and study progress.',
          },
        ]
      : SLIDES;

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') finishTour();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, finishTour]);

  if (!open) return null;

  const currentIndex = Math.min(index, slides.length - 1);
  const slide = slides[currentIndex];
  const isLast = currentIndex === slides.length - 1;
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feature-tour-title"
        className="animate-scale-in w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-lg"
      >
        <div
          className="flex flex-col items-center gap-4 px-6 pb-4 pt-8 text-center"
          aria-live="polite"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 id="feature-tour-title" className="text-xl font-semibold">
            {currentIndex === 0 ? (
              <BilingualText english={slide.title} japanese="はなぞのへようこそ" />
            ) : (
              slide.title
            )}
          </h2>
          <p className="min-h-[4.5rem] text-sm text-muted-foreground">{slide.text}</p>
        </div>

        {slide.learningFlow && (
          <div
            className="grid grid-cols-3 gap-2 px-6 pb-6"
            aria-label="Scenarios, then flashcards, then simulator"
            role="list"
          >
            {LEARNING_STEPS.map(({ icon: StepIcon, label }, stepIndex) => (
              <div
                key={label}
                role="listitem"
                className="flex min-w-0 flex-col items-center gap-1 rounded-lg border border-border bg-background/60 p-2 text-center"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Step {stepIndex + 1}
                </span>
                <StepIcon className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center gap-1.5 pb-4" aria-hidden="true">
          {slides.map((s, i) => (
            <span
              key={s.title}
              className={cn(
                'h-1.5 w-1.5 rounded-full transition-colors',
                i === currentIndex ? 'bg-foreground' : 'bg-border',
              )}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border px-6 py-4">
          <Button variant="ghost" className="cursor-pointer" onClick={finishTour}>
            Skip
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              disabled={currentIndex === 0}
              onClick={() => setIndex(currentIndex - 1)}
            >
              Back
            </Button>
            {isLast ? (
              <Button
                className="dialog-primary-button cursor-pointer"
                onClick={finishTour}
              >
                Start learning
              </Button>
            ) : (
              <Button
                className="dialog-primary-button cursor-pointer"
                onClick={() => setIndex(currentIndex + 1)}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
