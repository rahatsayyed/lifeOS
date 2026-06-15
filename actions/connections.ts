'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendConnectionRequest(email: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  // Look up target user by email
  const { data: target } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()

  if (!target) throw new Error('User not found')
  if (target.id === user.id) throw new Error('Cannot connect to yourself')

  // Check if connection already exists
  const { data: existing } = await supabase
    .from('connections')
    .select('id, status')
    .or(`and(user_a_id.eq.${user.id},user_b_id.eq.${target.id}),and(user_a_id.eq.${target.id},user_b_id.eq.${user.id})`)
    .maybeSingle()

  if (existing) {
    throw new Error(existing.status === 'accepted' ? 'Already connected' : 'Request already sent')
  }

  const id = crypto.randomUUID()
  const { error } = await supabase.from('connections').insert({
    id,
    user_a_id: user.id,
    user_b_id: target.id,
    status: 'pending',
  })
  if (error) throw error
  revalidatePath('/settings/connections')
}

export async function acceptConnection(connectionId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const { error } = await supabase
    .from('connections')
    .update({ status: 'accepted' })
    .eq('id', connectionId)
    .eq('user_b_id', user.id)
  if (error) throw error
  revalidatePath('/settings/connections')
}

export async function getConnections() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { pending: [], accepted: [] }

  const { data } = await supabase
    .from('connections')
    .select(`
      id, status, user_a_id, user_b_id,
      user_a:users!connections_user_a_id_fkey(id, name, email, avatar_url),
      user_b:users!connections_user_b_id_fkey(id, name, email, avatar_url)
    `)
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)

  const connections = (data ?? []).map((c) => {
    const isA = c.user_a_id === user.id
    const partner = isA ? c.user_b : c.user_a
    const isIncoming = !isA && c.status === 'pending'
    return {
      id: c.id,
      status: c.status,
      partner,
      isIncoming,
    }
  })

  return {
    pending: connections.filter((c) => c.status === 'pending'),
    accepted: connections.filter((c) => c.status === 'accepted'),
  }
}

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  return data
}

export async function signOut() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  revalidatePath('/')
}
