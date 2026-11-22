'use client';

import Link from 'next/link';
import { BarChart3, Bookmark, Camera, Settings2, Target, UserRound } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useOnboardingStore } from '@/store/onboarding';
import { markInfoPopupShown, useInfoPopupCooldown } from '@/hooks/useInfoPopupCooldown';
import { Button } from '@/components/ui/button';
import { isAdminEmail } from '@/lib/admin';

const FEATURES = [
  {
    icon: BarChart3,
    text: 'See phrases reviewed, cards due, study days and simulator practice at a glance.',
  },
  {
    icon: Bookmark,
    text: 'Save useful phrases and review them together in a focused flashcard queue.',
  },
  {
    icon: Target,
    text: 'Set daily and weekly goals, earn milestone badges, and protect your streak.',
  },
  {
    icon: Settings2,
    text: 'Choose your theme, romaji display mode and speech playback speed.',
  },
  {
    icon: Camera,
    text: 'Update your display name and picture, and check your account activity.',
  },
];

// Shown once to signed-in users, after the feature tour and popup cooldown.
export function ProfileIntro() {
  const user = useAuthStore((s) => s.user);
  const synced = useOnboardingStore((s) => s.synced);
  const hasOnboarded = useOnboardingStore((s) => s.hasOnboarded);
  const profileIntroSeen = useOnboardingStore((s) => s.profileIntroSeen);
  const featureTourSeen = useOnboardingStore((s) => s.featureTourSeen);
  const markProfileIntroSeen = useOnboardingStore((s) => s.markProfileIntroSeen);
  const cooldownAvailable = useInfoPopupCooldown(user ? 'device' : null);
  const features =
    user && isAdminEmail(user.email)
      ? [
          ...FEATURES,
          {
            icon: BarChart3,
            text: 'As the app owner, review registered users and their activity in the admin section.',
          },
        ]
      : FEATURES;

  if (
    !user ||
    !synced ||
    !hasOnboarded ||
    profileIntroSeen ||
    !featureTourSeen ||
    !cooldownAvailable
  )
    return null;

  function finishIntro() {
    markInfoPopupShown('device');
    markProfileIntroSeen();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-intro-title"
        className="animate-scale-in max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-lg border border-border bg-card shadow-lg"
      >
        <div className="gradient-brand px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            New
          </p>
          <h2 id="profile-intro-title" className="text-xl font-semibold">
            Meet your profile
          </h2>
        </div>
        <div className="flex flex-col gap-4 p-6">
          <p className="text-sm text-muted-foreground">
            Your progress now has a home. Here is what you will find there:
          </p>
          <ul className="flex flex-col gap-3">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap justify-end gap-2">
            <Button variant="ghost" className="cursor-pointer" onClick={finishIntro}>
              Got it
            </Button>
            <Button asChild className="cursor-pointer" onClick={finishIntro}>
              <Link href="/profile">
                <UserRound className="h-4 w-4" aria-hidden="true" />
                Open my profile
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
