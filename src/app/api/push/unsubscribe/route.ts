import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Not signed in' }, { status: 401 })
  }

  const { endpoint } = (await req.json()) as { endpoint?: string }
  if (!endpoint) {
    return Response.json({ error: 'Missing endpoint' }, { status: 400 })
  }

  const { error } = await supabase
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
