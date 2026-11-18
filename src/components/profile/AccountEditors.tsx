'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { syncAccountFields } from '@/lib/supabase/profile'
import { normalizePhone } from '@/lib/auth/phone'
import { useOnboardingStore } from '@/store/onboarding'
import { Button } from '@/components/ui/button'

const inputClass = 'w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm'
const MAX_NAME_LENGTH = 40
const MIN_PASSWORD_LENGTH = 8

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : 'Something went wrong. Please try again.'
}

// Sets a new password for the signed-in account. Email/password accounts don't need the current one here.
export function PasswordEditor({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (password !== confirm) {
      setError('The two passwords do not match.')
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await createClient().auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError(errorMessage(error))
      return
    }
    setSaved(true)
  }

  if (saved) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">Your password has been updated.</p>
        <Button type="button" size="sm" variant="ghost" className="w-fit cursor-pointer" onClick={onDone}>Done</Button>
      </div>
    )
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <input
        autoFocus
        type="password"
        autoComplete="new-password"
        minLength={MIN_PASSWORD_LENGTH}
        required
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="New password"
        className={inputClass}
      />
      <input
        type="password"
        autoComplete="new-password"
        required
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        placeholder="Confirm new password"
        className={inputClass}
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="cursor-pointer gap-2" disabled={loading}>
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Update password
        </Button>
        <Button type="button" size="sm" variant="ghost" className="cursor-pointer" onClick={onDone}>Cancel</Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  )
}

// Each editor is shown inline under its row on the account card
export function NameEditor({ onDone }: { onDone: () => void }) {
  const userName = useOnboardingStore(s => s.userName)
  const setUserName = useOnboardingStore(s => s.setUserName)
  const [name, setName] = useState(userName)
  const [error, setError] = useState<string | null>(null)

  function save(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || trimmed.length > MAX_NAME_LENGTH) {
      setError(`Use between 1 and ${MAX_NAME_LENGTH} characters.`)
      return
    }
    setUserName(trimmed)
    onDone()
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-2 sm:flex-row">
      <input
        autoFocus
        value={name}
        maxLength={MAX_NAME_LENGTH}
        onChange={e => setName(e.target.value)}
        placeholder="Your name"
        className={inputClass}
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="cursor-pointer">Save</Button>
        <Button type="button" size="sm" variant="ghost" className="cursor-pointer" onClick={onDone}>Cancel</Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  )
}

// Supabase emails a confirmation link to the new address before the change takes effect
export function EmailEditor({ current, onDone }: { current: string | undefined; onDone: () => void }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const next = email.trim()
    if (next === current) {
      setError('That is already your email.')
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await createClient().auth.updateUser({ email: next })
    setLoading(false)
    if (error) {
      setError(errorMessage(error))
      return
    }
    setSentTo(next)
  }

  if (sentTo) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">
          We sent a confirmation link to {sentTo}. Open it to finish changing your email.
        </p>
        <Button type="button" size="sm" variant="ghost" className="w-fit cursor-pointer" onClick={onDone}>Done</Button>
      </div>
    )
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-2 sm:flex-row">
      <input
        autoFocus
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="new@example.com"
        className={inputClass}
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="cursor-pointer gap-2" disabled={loading}>
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Send confirmation
        </Button>
        <Button type="button" size="sm" variant="ghost" className="cursor-pointer" onClick={onDone}>Cancel</Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  )
}

// Two steps: send an SMS code to the new number, then confirm it
export function PhoneEditor({ onDone }: { onDone: () => void }) {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [pending, setPending] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sendCode(e: React.FormEvent) {
    e.preventDefault()
    const normalized = normalizePhone(phone)
    if (!normalized) {
      setError('Use the full number with country code, for example +1 555 123 4567.')
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await createClient().auth.updateUser({ phone: normalized })
    setLoading(false)
    if (error) {
      setError(errorMessage(error))
      return
    }
    setPending(normalized)
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault()
    if (!pending) return
    setLoading(true)
    setError(null)
    const { data, error } = await createClient().auth.verifyOtp({ phone: pending, token: code, type: 'phone_change' })
    setLoading(false)
    if (error) {
      setError(errorMessage(error))
      return
    }
    if (data.user) void syncAccountFields(data.user)
    onDone()
  }

  if (pending) {
    return (
      <form onSubmit={verify} className="flex flex-col gap-2 sm:flex-row">
        <input
          autoFocus
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="6-digit code"
          className={inputClass}
        />
        <div className="flex gap-2">
          <Button type="submit" size="sm" className="cursor-pointer gap-2" disabled={loading || code.length !== 6}>
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Confirm
          </Button>
          <Button type="button" size="sm" variant="ghost" className="cursor-pointer" onClick={onDone}>Cancel</Button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </form>
    )
  }

  return (
    <form onSubmit={sendCode} className="flex flex-col gap-2 sm:flex-row">
      <input
        autoFocus
        type="tel"
        inputMode="tel"
        required
        value={phone}
        onChange={e => setPhone(e.target.value)}
        placeholder="+1 555 123 4567"
        className={inputClass}
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="cursor-pointer gap-2" disabled={loading}>
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Send code
        </Button>
        <Button type="button" size="sm" variant="ghost" className="cursor-pointer" onClick={onDone}>Cancel</Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  )
}
