'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Languages, Layers, Lightbulb, Mic, MessageSquare, Search, Sparkles, Target, UserRound } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useOnboardingStore } from '@/store/onboarding'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const SLIDES = [
  {
    icon: Sparkles,
    title: 'Welcome to Hanazono',
    text: 'Practical Japanese for everyday life in Japan. Here is a quick tour of what you can do.',
  },
  {
    icon: BookOpen,
    title: 'Scenarios',
    text: 'Phrases grouped by real situations: ordering food and drinks, shopping, getting around and more. Combine items, quantities and common words like "and", "this" and "more".',
  },
  {
    icon: Languages,
    title: 'Kana',
    text: 'Learn hiragana and katakana step by step, with drills that test you on each character.',
  },
  {
    icon: Layers,
    title: 'Flashcards',
    text: 'Spaced repetition shows each phrase just before you would forget it. Type your answer and the app grades it.',
  },
  {
    icon: Mic,
    title: 'Speaking and listening',
    text: 'Listen to native-quality audio, then practise saying the phrases yourself.',
  },
  {
    icon: MessageSquare,
    title: 'Simulator',
    text: 'Hold a conversation with an AI partner in Japanese, then get feedback on your replies.',
  },
  {
    icon: Search,
    title: 'Word lookup',
    text: 'Search any Japanese word or phrase to see its meaning, reading and usage.',
  },
  {
    icon: Target,
    title: 'Daily goal and badges',
    text: 'Set a daily goal, keep your streak alive and unlock milestone badges as you improve.',
  },
  {
    icon: UserRound,
    title: 'Your progress',
    text: 'Your progress, streak and profile are saved to your account, so they follow you to any device.',
  },
  {
    icon: Lightbulb,
    title: 'Etiquette tips',
    text: 'Short notes on polite behaviour in Japan, so you know what to say and do in common situations.',
  },
]

// Shown once after sign-in to everyone, new or returning, introducing the app's features
export function FeatureTour() {
  const user = useAuthStore(s => s.user)
  const synced = useOnboardingStore(s => s.synced)
  const hasOnboarded = useOnboardingStore(s => s.hasOnboarded)
  const featureTourSeen = useOnboardingStore(s => s.featureTourSeen)
  const markFeatureTourSeen = useOnboardingStore(s => s.markFeatureTourSeen)
  const [index, setIndex] = useState(0)

  const open = Boolean(user && synced && hasOnboarded && !featureTourSeen)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') markFeatureTourSeen()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, markFeatureTourSeen])

  if (!open) return null

  const slide = SLIDES[index]
  const isLast = index === SLIDES.length - 1
  const Icon = slide.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feature-tour-title"
        className="animate-scale-in w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-lg"
      >
        <div className="flex flex-col items-center gap-4 px-6 pb-4 pt-8 text-center" aria-live="polite">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 id="feature-tour-title" className="text-xl font-semibold">
            {slide.title}
          </h2>
          <p className="min-h-[4.5rem] text-sm text-muted-foreground">{slide.text}</p>
        </div>

        <div className="flex justify-center gap-1.5 pb-4" aria-hidden="true">
          {SLIDES.map((s, i) => (
            <span
              key={s.title}
              className={cn('h-1.5 w-1.5 rounded-full transition-colors', i === index ? 'bg-foreground' : 'bg-border')}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border px-6 py-4">
          <Button variant="ghost" className="cursor-pointer" onClick={markFeatureTourSeen}>
            Skip
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              disabled={index === 0}
              onClick={() => setIndex(i => i - 1)}
            >
              Back
            </Button>
            {isLast ? (
              <Button className="cursor-pointer" onClick={markFeatureTourSeen}>
                Start learning
              </Button>
            ) : (
              <Button className="cursor-pointer" onClick={() => setIndex(i => i + 1)}>
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
