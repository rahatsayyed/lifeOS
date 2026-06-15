'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createReminder(data: {
  title: string
  remind_at: string
  repeat: 'none' | 'daily' | 'weekly'
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const id = crypto.randomUUID()
  const { error } = await supabase.from('reminders').insert({
    id,
    owner_id: user.id,
    title: data.title,
    remind_at: data.remind_at,
    repeat: data.repeat,
    done: false,
  })
  if (error) throw error
  revalidatePath('/reminders')
  return id
}

export async function deleteReminder(id: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)
  if (error) throw error
  revalidatePath('/reminders')
}

export async function getReminders() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('reminders')
    .select('*')
    .eq('owner_id', user.id)
    .order('remind_at', { ascending: true })

  return data ?? []
}
