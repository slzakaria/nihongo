'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useSignInDialogStore } from '@/store/signInDialog'
import { Button } from '@/components/ui/button'

const DISMISSED_KEY = 'nihongo-signin-invite-dismissed'

// Invites signed-out visitors to sign in once they navigate past the homepage. Dismissal lasts for the tab session.
export function SignInInvite() {
  const pathname = usePathname()
  const user = useAuthStore(s => s.user)
  const loaded = useAuthStore(s => s.loaded)
  const [dismissed, setDismissed] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem(DISMISSED_KEY) === '1'
  )
  const showSignIn = useSignInDialogStore(s => s.show)

  const shouldShow = loaded && !user && !dismissed && pathname !== '/' && !pathname.startsWith('/auth')
  if (!shouldShow) return null

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

  return (
    <div
      role="dialog"
      aria-label="Sign in to save your progress"
      className="animate-scale-in fixed bottom-4 left-4 z-40 w-72 max-w-[calc(100vw-6rem)] rounded-lg border border-border bg-card p-4 shadow-lg"
    >
      <p className="text-sm font-medium">Save your progress</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Sign in to sync your flashcards and phrase progress across devices.
      </p>
      <div className="mt-3">
        <div className="flex gap-2">
          <Button size="sm" className="cursor-pointer" onClick={showSignIn}>
            Sign in
          </Button>
          <Button size="sm" variant="ghost" className="cursor-pointer" onClick={dismiss}>
            Not now
          </Button>
        </div>
      </div>
    </div>
  )
}
