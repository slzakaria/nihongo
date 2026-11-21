'use client'

import { useEffect } from 'react'
import { LogIn, X } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useRateLimitDialogStore } from '@/store/rateLimitDialog'
import { useSignInDialogStore } from '@/store/signInDialog'
import { Button } from '@/components/ui/button'

// Centered popup shown whenever a guest hits an anonymous rate limit (TTS, STT, word lookup,
// simulator, scoring...). Closes on Escape, backdrop click, or the close button, and hands off
// to the sign-in dialog so the user can remove the limit entirely.
export function RateLimitDialog() {
  const open = useRateLimitDialogStore(s => s.open)
  const message = useRateLimitDialogStore(s => s.message)
  const hide = useRateLimitDialogStore(s => s.hide)
  const showSignIn = useSignInDialogStore(s => s.show)
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') hide()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, hide])

  // Signing in removes the limit entirely, so close this if it opens up behind the sign-in flow
  useEffect(() => {
    if (user) hide()
  }, [user, hide])

  if (!open || user) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={e => {
        if (e.target === e.currentTarget) hide()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rate-limit-title"
        className="animate-scale-in relative w-full max-w-sm overflow-hidden rounded-lg border border-border bg-card shadow-lg"
      >
        <div className="gradient-brand px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Guest limit reached</p>
          <h2 id="rate-limit-title" className="text-xl font-semibold">
            Slow down a little
          </h2>
        </div>
        <div className="flex flex-col gap-4 px-6 py-5">
          <p className="text-sm text-muted-foreground">{message}</p>
          <p className="text-sm">Sign in for free to remove this limit and sync your progress across devices.</p>
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button
              type="button"
              className="cursor-pointer"
              onClick={() => {
                hide()
                showSignIn()
              }}
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Button>
            <Button type="button" variant="outline" className="cursor-pointer" onClick={hide}>
              Maybe later
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={hide}
          aria-label="Close"
          className="absolute right-3 top-3 cursor-pointer rounded-full p-1 text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
