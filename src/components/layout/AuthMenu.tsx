'use client'

import { useEffect, useRef, useState } from 'react'
import { LogOut, Loader2, Mail, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Step = 'email' | 'code'

export function AuthMenu() {
  const user = useAuthStore(s => s.user)
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function sendCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setStep('code')
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setOpen(false)
    setStep('email')
    setEmail('')
    setCode('')
  }

  async function signOut() {
    await supabase.auth.signOut()
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Account"
        onClick={() => setOpen(o => !o)}
				className='cursor-pointer'
      >
        <User className="h-4 w-4" />
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 w-64 rounded-md border border-border bg-card p-3 shadow-md">
          {user ? (
            <div className="space-y-2">
              <p className="px-1 text-xs font-medium text-muted-foreground">Signed in as</p>
              <p className="truncate px-1 text-sm">{user.email}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 cursor-pointer"
                onClick={signOut}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </Button>
            </div>
          ) : step === 'email' ? (
            <form onSubmit={sendCode} className="space-y-2">
              <p className="px-1 text-xs font-medium text-muted-foreground">
                Sign in to sync progress
              </p>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              />
              {error && <p className="px-1 text-xs text-red-500">{error}</p>}
              <Button type="submit" size="sm" className="w-full gap-2 cursor-pointer" disabled={loading}>
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
                Send code
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="space-y-2">
              <p className="px-1 text-xs font-medium text-muted-foreground">
                Enter the 6-digit code sent to {email}
              </p>
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="123456"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm tracking-widest"
              />
              {error && <p className="px-1 text-xs text-red-500">{error}</p>}
              <Button type="submit" size="sm" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Verify'}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setError(null)
                }}
                className={cn('w-full text-center text-xs text-muted-foreground hover:underline')}
              >
                Use a different email
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
