'use client'

import { useState } from 'react'
import { Loader2, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { markSignedInNow } from '@/lib/auth/session'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Mode = 'password' | 'link' | 'signup'
type Step = 'form' | 'checkEmail' | 'linkSent' | 'resetSent'

export const MIN_PASSWORD_LENGTH = 8

const MODES: { value: Mode; label: string }[] = [
  { value: 'password', label: 'Password' },
  { value: 'link', label: 'Magic link' },
  { value: 'signup', label: 'New account' },
]

const inputClass = 'w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm'

// Password sign-in, a magic link emailed to the user, or a new account. Forgot password emails a reset link.
export function SignInForm() {
  const [mode, setMode] = useState<Mode>('password')
  const [step, setStep] = useState<Step>('form')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  function callbackUrl(next: string) {
    return `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`
  }

  function switchMode(next: Mode) {
    setMode(next)
    setStep('form')
    setError(null)
  }

  async function sendLink() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: callbackUrl(window.location.pathname + window.location.search),
      },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setStep('linkSent')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (mode === 'link') {
      await sendLink()
      return
    }

    if (mode === 'signup' && password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`)
      return
    }

    setLoading(true)
    if (mode === 'password') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) {
        setError(
          error.message === 'Invalid login credentials'
            ? 'Wrong email or password. Try again, or use "Forgot password".'
            : error.message
        )
        return
      }
      // Password sign-ins don't pass through /auth/confirm, so record the sign-in time here
      markSignedInNow()
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: callbackUrl(window.location.pathname) },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    // Supabase answers "already registered" with an empty identities list and sends no email
    if (data.user && data.user.identities?.length === 0) {
      setError('An account already exists for this email. Sign in with your password, use a magic link, or choose "Forgot password?".')
      return
    }
    if (data.session) {
      markSignedInNow()
    } else {
      setStep('checkEmail')
    }
  }

  async function sendReset(e?: React.FormEvent) {
    e?.preventDefault()
    if (!email) {
      setError('Enter your email first, then choose "Forgot password".')
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: callbackUrl('/profile?password=1'),
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setStep('resetSent')
  }

  if (step === 'linkSent') {
    return (
      <div className="space-y-2">
        <p className="px-1 text-xs font-medium text-muted-foreground">
          We sent a sign-in link to {email}. Open it on this device to finish signing in.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full cursor-pointer"
          onClick={() => void sendLink()}
          disabled={loading}
        >
          Resend link
        </Button>
        <button
          type="button"
          onClick={() => switchMode('link')}
          className="w-full cursor-pointer text-center text-xs text-muted-foreground hover:underline"
        >
          Use a different email
        </button>
      </div>
    )
  }

  if (step === 'checkEmail') {
    return (
      <div className="space-y-2">
        <p className="px-1 text-xs font-medium text-muted-foreground">
          We sent a confirmation link to {email}. Open it on this device to finish creating your account.
        </p>
        <button
          type="button"
          onClick={() => switchMode('password')}
          className="w-full cursor-pointer text-center text-xs text-muted-foreground hover:underline"
        >
          Back to sign in
        </button>
      </div>
    )
  }

  if (step === 'resetSent') {
    return (
      <div className="space-y-2">
        <p className="px-1 text-xs font-medium text-muted-foreground">
          We sent a link to {email} to reset your password. Open it on this device to choose a new one.
        </p>
        <button
          type="button"
          onClick={() => switchMode('password')}
          className="w-full cursor-pointer text-center text-xs text-muted-foreground hover:underline"
        >
          Back to sign in
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-2" autoComplete="off">
      <div className="flex gap-1 rounded-md border border-border p-0.5" role="tablist" aria-label="Account">
        {MODES.map(m => (
          <button
            key={m.value}
            type="button"
            role="tab"
            aria-selected={mode === m.value}
            onClick={() => switchMode(m.value)}
            className={cn(
              'flex flex-1 cursor-pointer items-center justify-center rounded px-2 py-1 text-xs font-medium transition-colors',
              mode === m.value ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-muted'
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <input
        type="email"
        required
        autoComplete="off"
        placeholder="you@example.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className={inputClass}
      />
      {mode !== 'link' && (
        <input
          type="password"
          required
          minLength={mode === 'signup' ? MIN_PASSWORD_LENGTH : undefined}
          autoComplete="new-password"
          placeholder={mode === 'signup' ? `Password (min. ${MIN_PASSWORD_LENGTH} characters)` : 'Password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          className={inputClass}
        />
      )}

      {error && <p className="px-1 text-xs text-red-500">{error}</p>}

      <Button type="submit" size="sm" className="w-full gap-2 cursor-pointer" disabled={loading}>
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
        {mode === 'password' ? 'Sign in' : mode === 'link' ? 'Email me a link' : 'Create account'}
      </Button>

      {mode === 'password' && (
        <button
          type="button"
          onClick={() => void sendReset()}
          disabled={loading}
          className="w-full cursor-pointer text-center text-xs text-muted-foreground hover:underline"
        >
          Forgot password?
        </button>
      )}
    </form>
  )
}
