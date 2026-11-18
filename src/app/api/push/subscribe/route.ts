import { NextRequest } from 'next/server'
import { currentServerUser, serverSupabase } from '@/lib/auth/server'

export async function POST(req: NextRequest) {
  const user = await currentServerUser()
  if (!user) {
    return Response.json({ error: 'Not signed in' }, { status: 401 })
  }

  const sub = (await req.json()) as { endpoint?: string; keys?: { p256dh?: string; auth?: string } }
  if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return Response.json({ error: 'Invalid subscription' }, { status: 400 })
  }

  const { error } = await serverSupabase(user).from('push_subscriptions').upsert(
    { user_id: user.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    { onConflict: 'endpoint' }
  )
  if (error) {
    console.error(error)
    return Response.json({ error: 'Failed to save subscription' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
