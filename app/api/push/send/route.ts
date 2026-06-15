import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import webpush from 'web-push'

export async function GET(request: Request) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )
  // Verify Vercel Cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceRoleClient()
  const now = new Date().toISOString()

  // Find due reminders
  const { data: reminders } = await supabase
    .from('reminders')
    .select('*, users!inner(id)')
    .lte('remind_at', now)
    .eq('done', false)

  if (!reminders?.length) {
    return NextResponse.json({ sent: 0 })
  }

  let sent = 0

  for (const reminder of reminders) {
    // Get user's push subscriptions
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', reminder.owner_id)

    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          sub.subscription as webpush.PushSubscription,
          JSON.stringify({
            title: '⏰ Reminder',
            body: reminder.title,
            url: '/reminders',
          })
        )
        sent++
      } catch {
        // Subscription may be expired — ignore
      }
    }

    // Mark done (or reschedule if repeating)
    if (reminder.repeat === 'none') {
      await supabase.from('reminders').update({ done: true }).eq('id', reminder.id)
    } else {
      const nextDate = new Date(reminder.remind_at)
      if (reminder.repeat === 'daily') nextDate.setDate(nextDate.getDate() + 1)
      if (reminder.repeat === 'weekly') nextDate.setDate(nextDate.getDate() + 7)
      await supabase
        .from('reminders')
        .update({ remind_at: nextDate.toISOString() })
        .eq('id', reminder.id)
    }
  }

  return NextResponse.json({ sent })
}
