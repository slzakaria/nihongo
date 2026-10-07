import { NextRequest } from 'next/server'
import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'

// Triggered by Vercel Cron (see vercel.json) — fans out a push notification to every
// signed-in user who has at least one SRS card due for review right now.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  const supabase = createAdminClient()

  const { data: dueCards, error: dueError } = await supabase
    .from('srs_cards')
    .select('user_id')
    .lte('next_review', new Date().toISOString())

  if (dueError) {
    console.error(dueError)
    return Response.json({ error: 'Failed to query due cards' }, { status: 500 })
  }

  const dueCountByUser = new Map<string, number>()
  for (const row of dueCards ?? []) {
    dueCountByUser.set(row.user_id, (dueCountByUser.get(row.user_id) ?? 0) + 1)
  }

  if (dueCountByUser.size === 0) {
    return Response.json({ sent: 0 })
  }

  const { data: subs, error: subsError } = await supabase
    .from('push_subscriptions')
    .select('*')
    .in('user_id', Array.from(dueCountByUser.keys()))

  if (subsError) {
    console.error(subsError)
    return Response.json({ error: 'Failed to query subscriptions' }, { status: 500 })
  }

  let sent = 0
  for (const sub of subs ?? []) {
    const due = dueCountByUser.get(sub.user_id) ?? 0
    const payload = JSON.stringify({
      title: 'Phrases due for review',
      body: `You have ${due} phrase${due === 1 ? '' : 's'} ready to review.`,
      url: '/profile',
    })

    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
      sent++
    } catch (err) {
      const statusCode = (err as { statusCode?: number })?.statusCode
      if (statusCode === 404 || statusCode === 410) {
        // Subscription expired/revoked on the browser side — clean it up
        await supabase.from('push_subscriptions').delete().eq('id', sub.id)
      } else {
        console.error('Push send failed', err)
      }
    }
  }

  return Response.json({ sent })
}
