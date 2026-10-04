'use client'

import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { useOnboardingStore } from '@/store/onboarding'
import { useAudio } from '@/hooks/useAudio'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Case-insensitive, trimmed match against our small VIP list
const SPECIAL_NAMES = ['rimane', 'riri', 'youssra', 'youyou', 'narimane', 'youss' , 'yous']

// NOTE: the specific message requested for the VIP list contained profanity
const SPECIAL_MESSAGE = "SEYEBT LIKOM ZBEL DEBRO KRRKOM TEMA, KOLA YNECH ALA KBALTO. 👋"
const SPECIAL_VOICE_MESSAGE = (name: string) => `ようこそ、${name}さん！日本語の勉強、頑張ってね！`
const DEFAULT_MESSAGE = (name: string) => `Happy learning${name ? `, ${name}` : ''}! 頑張って 🎌`

export function WelcomeDialog() {
  const hasOnboarded = useOnboardingStore(s => s.hasOnboarded)
  const completeOnboarding = useOnboardingStore(s => s.completeOnboarding)
  const { play } = useAudio()
  const [name, setName] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    const isSpecial = SPECIAL_NAMES.includes(trimmed.toLowerCase())
    completeOnboarding(trimmed)
    setToastMessage(isSpecial ? SPECIAL_MESSAGE : DEFAULT_MESSAGE(trimmed))
    if (isSpecial) {
      void play(SPECIAL_VOICE_MESSAGE(trimmed))
      confetti({ particleCount: 550, spread: 150, origin: { y: 0.6 } })
    }
  }

  if (!hasOnboarded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-lg"
        >
          <div>
            <h2 className="text-lg font-semibold">ようこそ！ Welcome</h2>
            <p className="text-sm text-muted-foreground">
              What should we call you? (purely cosmetic — nothing is sent anywhere)
            </p>
          </div>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit">Start learning</Button>
        </form>
      </div>
    )
  }

  return toastMessage ? (
    <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
  ) : null
}

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      className={cn(
        'fixed bottom-12 left-1/2 z-50 -translate-x-1/2 rounded-md border border-border',
        'bg-card px-4 py-3 text-md shadow-lg animate-bounce'
      )}
    >
      {message}
    </div>
  )
}
