import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SESSION_MAX_AGE_MS, SIGNED_IN_AT_COOKIE } from '@/lib/auth/session'

// Only same-site relative paths, so the redirect can't be used to send users off-site
function safeNext(next: string | null) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/'
}

// Target of the sign-in link. Supabase's PKCE flow returns a `code`; token_hash is the legacy email-link format.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = safeNext(searchParams.get('next'))

  const supabase = await createClient()
  let failed = true

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    failed = !!error
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    failed = !!error
  }

  if (failed) {
    return NextResponse.redirect(new URL('/auth/error', request.url))
  }

  const response = NextResponse.redirect(new URL(next, request.url))
  // Readable by the client on purpose: it only holds a timestamp, not a credential
  response.cookies.set(SIGNED_IN_AT_COOKIE, String(Date.now()), {
    path: '/',
    sameSite: 'lax',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_MAX_AGE_MS / 1000,
  })
  return response
}
