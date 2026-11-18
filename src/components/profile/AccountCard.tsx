'use client'

import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useOnboardingStore } from '@/store/onboarding'
import { SESSION_MAX_AGE_MS, readSignedInAt } from '@/lib/auth/session'
import { PHONE_AUTH_ENABLED } from '@/lib/auth/phone'
import { uploadAvatar, AVATAR_TYPES } from '@/lib/supabase/avatar'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { EmailEditor, NameEditor, PasswordEditor, PhoneEditor } from '@/components/profile/AccountEditors'

type EditableField = 'name' | 'email' | 'phone' | 'password'

function formatDate(value: string | null | undefined, withTime = false) {
  if (!value) return '—'
  const date = new Date(value)
  return withTime
    ? date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : date.toLocaleDateString(undefined, { dateStyle: 'long' })
}

// Account details: name, email, avatar, and the dates tied to this sign-in
export function AccountCard() {
  const user = useAuthStore(s => s.user)
  const userName = useOnboardingStore(s => s.userName)
  const avatarUrl = useOnboardingStore(s => s.avatarUrl)
  const setAvatarUrl = useOnboardingStore(s => s.setAvatarUrl)
  const fileInput = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [editing, setEditing] = useState<EditableField | null>(() =>
    // Reset links send users to /profile?password=1, so open the password editor straight away
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('password') === '1'
      ? 'password'
      : null
  )
  if (!user) return null

  async function handleFile(file: File | undefined) {
    if (!file || !user) return
    setUploading(true)
    setUploadError(null)
    try {
      setAvatarUrl(await uploadAvatar(user.id, file))
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const signedInAt = readSignedInAt()
  const sessionEnds = signedInAt ? new Date(Number(signedInAt) + SESSION_MAX_AGE_MS).toISOString() : null

  const rows: { key: EditableField | null; label: string; value: string }[] = [
    { key: 'name', label: 'Registered name', value: userName || '—' },
    { key: 'email', label: 'Email', value: user.email ?? '—' },
    { key: PHONE_AUTH_ENABLED ? 'phone' : null, label: 'Phone', value: user.phone ? `+${user.phone.replace(/^\+/, '')}` : '—' },
    { key: 'password', label: 'Password', value: '••••••••' },
    { key: null, label: 'Joined', value: formatDate(user.created_at) },
    { key: null, label: 'Last sign-in', value: formatDate(user.last_sign_in_at, true) },
    { key: null, label: 'Session ends', value: formatDate(sessionEnds, true) },
  ]

  function closeEditor() {
    setEditing(null)
  }

  return (
    <Card className="overflow-hidden">
      <div className="gradient-brand flex flex-wrap items-center gap-4 px-6 py-5">
        <div className="relative">
          <Avatar url={avatarUrl} label={userName || user.email || user.phone || '?'} className="h-16 w-16 text-xl shadow-sm" />
          {uploading && (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60">
              <Loader2 className="h-5 w-5 animate-spin" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">{userName || 'Traveller'}</p>
          <p className="truncate text-sm text-muted-foreground">{user.email ?? user.phone}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button type="button" variant="outline" size="sm" className="cursor-pointer gap-2" disabled={uploading} onClick={() => fileInput.current?.click()}>
            <Camera className="h-3.5 w-3.5" />
            {avatarUrl ? 'Change photo' : 'Upload photo'}
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept={AVATAR_TYPES.join(',')}
            className="hidden"
            onChange={e => void handleFile(e.target.files?.[0])}
          />
          {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
        </div>
      </div>
      <CardContent className="p-6">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          {rows.map(row => (
            <div key={row.label} className={cn('flex flex-col gap-1', editing === row.key && row.key && 'sm:col-span-2')}>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{row.label}</dt>
                {row.key && editing !== row.key && (
                  <button
                    type="button"
                    onClick={() => setEditing(row.key)}
                    className="cursor-pointer text-xs font-medium text-primary hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>
              <dd className="text-sm font-medium">{row.value}</dd>
              {row.key === 'name' && editing === 'name' && <NameEditor onDone={closeEditor} />}
              {row.key === 'email' && editing === 'email' && (
                <EmailEditor current={user.email ?? undefined} onDone={closeEditor} />
              )}
              {row.key === 'phone' && editing === 'phone' && <PhoneEditor onDone={closeEditor} />}
              {row.key === 'password' && editing === 'password' && <PasswordEditor onDone={closeEditor} />}
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
