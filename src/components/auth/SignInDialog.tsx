'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useSignInDialogStore } from '@/store/signInDialog'
import { SignIn } from '@clerk/nextjs'

// Centered sign-in popup with a branded header. Closes on Escape, backdrop click, or the close button,
// and closes itself once the user is signed in.
export function SignInDialog() {
  const open = useSignInDialogStore(s => s.open)
  const hide = useSignInDialogStore(s => s.hide)
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') hide()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, hide])

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
        aria-labelledby="sign-in-title"
        className="animate-scale-in relative w-full max-w-fit overflow-hidden rounded-xl border border-border bg-card shadow-lg"
      >
        <div className="gradient-brand px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Welcome back</p>
          <h2 id="sign-in-title" className="text-xl font-semibold">
            Sign in
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Sync your progress across every device.</p>
        </div>
        <div className="p-6">
          <SignIn routing="hash" />
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
