import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isSessionExpired, SIGNED_IN_AT_COOKIE } from '@/lib/auth/session'

// Refreshes the Supabase auth session cookie on every request (required by @supabase/ssr)
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Must not be removed — triggers a token refresh when the session is near expiry
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Sessions are revalidated every 6 hours: sign out (revokes the refresh token) once the sign-in time is stale
  if (user && isSessionExpired(request.cookies.get(SIGNED_IN_AT_COOKIE)?.value)) {
    await supabase.auth.signOut()
    supabaseResponse.cookies.delete(SIGNED_IN_AT_COOKIE)
  }

  return supabaseResponse
}
