// Supabase Edge Function — fires every minute via pg_cron
// Finds due reminders, sends Web Push notifications via VAPID

import { createClient } from 'jsr:@supabase/supabase-js@2'

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT')!

// Minimal VAPID JWT + Web Push implementation without npm webpush
async function sendPushNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string
) {
  // Build VAPID JWT
  const url = new URL(subscription.endpoint)
  const audience = `${url.protocol}//${url.host}`
  const expiration = Math.floor(Date.now() / 1000) + 12 * 60 * 60

  const header = { typ: 'JWT', alg: 'ES256' }
  const claims = { aud: audience, exp: expiration, sub: VAPID_SUBJECT }

  const base64url = (buf: Uint8Array) =>
    btoa(String.fromCharCode(...buf)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

  const encoder = new TextEncoder()
  const headerB64 = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  const claimsB64 = btoa(JSON.stringify(claims)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  const signingInput = `${headerB64}.${claimsB64}`

  // Import VAPID private key
  const privateKeyBytes = Uint8Array.from(atob(VAPID_PRIVATE_KEY.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBytes,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    encoder.encode(signingInput)
  )

  const jwt = `${signingInput}.${base64url(new Uint8Array(signature))}`

  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'TTL': '60',
      'Authorization': `vapid t=${jwt},k=${VAPID_PUBLIC_KEY}`,
    },
    body: encoder.encode(payload),
  })

  return response.ok
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const now = new Date().toISOString()

  const { data: reminders } = await supabase
    .from('reminders')
    .select('*')
    .lte('remind_at', now)
    .eq('done', false)

  if (!reminders?.length) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 })
  }

  let sent = 0

  for (const reminder of reminders) {
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', reminder.owner_id)

    for (const sub of subs ?? []) {
      try {
        const payload = JSON.stringify({
          title: '⏰ Reminder',
          body: reminder.title,
          url: '/reminders',
        })
        const ok = await sendPushNotification(sub.subscription as never, payload)
        if (ok) sent++
      } catch {
        // Expired subscription — ignore
      }
    }

    // Mark done or reschedule
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

  return new Response(JSON.stringify({ sent }), { status: 200 })
})
