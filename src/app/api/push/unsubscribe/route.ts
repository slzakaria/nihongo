import { NextRequest } from 'next/server'
import { currentServerUser, serverSupabase } from '@/lib/auth/server'

export async function POST(req: NextRequest) {
  const user = await currentServerUser()
  if (!user) {
    return Response.json({ error: 'Not signed in' }, { status: 401 })
  }

  const { endpoint } = (await req.json()) as { endpoint?: string }
  if (!endpoint) {
    return Response.json({ error: 'Missing endpoint' }, { status: 400 })
  }

  const { error } = await serverSupabase(user)
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', endpoint)
  if (error) {
    console.error(error)
    return Response.json({ error: 'Failed to remove subscription' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
