'use client'

import Link from 'next/link'
import { BarChart3, Camera, Flame, Mail, UserRound } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useOnboardingStore } from '@/store/onboarding'
import { Button } from '@/components/ui/button'

const FEATURES = [
  { icon: UserRound, text: 'Your account details, with the date you joined and your last sign-in' },
  { icon: BarChart3, text: 'Progress for every scenario, flashcard deck and simulator conversation' },
  { icon: Flame, text: 'Your current streak and how many days you have studied' },
  { icon: Mail, text: 'Change your name, email or phone number at any time' },
  { icon: Camera, text: 'Upload a profile picture that shows in the navbar' },
]

// Shown once to returning users after sign-in, introducing the profile page
export function ProfileIntro() {
  const user = useAuthStore(s => s.user)
  const synced = useOnboardingStore(s => s.synced)
  const hasOnboarded = useOnboardingStore(s => s.hasOnboarded)
  const profileIntroSeen = useOnboardingStore(s => s.profileIntroSeen)
  const featureTourSeen = useOnboardingStore(s => s.featureTourSeen)
  const markProfileIntroSeen = useOnboardingStore(s => s.markProfileIntroSeen)

  // Waits for the feature tour so the two dialogs don't stack
  if (!user || !synced || !hasOnboarded || profileIntroSeen || !featureTourSeen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-intro-title"
        className="animate-scale-in w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-lg"
      >
        <div className="gradient-brand px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">New</p>
          <h2 id="profile-intro-title" className="text-xl font-semibold">
            Meet your profile
          </h2>
        </div>
        <div className="flex flex-col gap-4 p-6">
          <p className="text-sm text-muted-foreground">
            Your progress now has a home. Here is what you will find there:
          </p>
          <ul className="flex flex-col gap-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap justify-end gap-2">
            <Button variant="ghost" className="cursor-pointer" onClick={markProfileIntroSeen}>
              Got it
            </Button>
            <Button asChild className="cursor-pointer" onClick={markProfileIntroSeen}>
              <Link href="/profile">
                <UserRound className="h-4 w-4" aria-hidden="true" />
                Open my profile
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
