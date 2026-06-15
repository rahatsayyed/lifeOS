'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getTodayISO } from '@/lib/utils/dates'

export async function createHabit(data: {
  name: string
  frequency: 'daily' | 'specific_days'
  days_of_week: number[] | null
  color: string
  icon: string
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const id = crypto.randomUUID()
  const { error } = await supabase.from('habits').insert({
    id,
    owner_id: user.id,
    ...data,
  })
  if (error) throw error
  revalidatePath('/habits')
  return id
}

export async function updateHabit(
  id: string,
  data: { name?: string; color?: string; icon?: string }
) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const { error } = await supabase
    .from('habits')
    .update(data)
    .eq('id', id)
    .eq('owner_id', user.id)
  if (error) throw error
  revalidatePath('/habits')
}

export async function deleteHabit(id: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)
  if (error) throw error
  revalidatePath('/habits')
}

export async function logHabit(habitId: string, date: string, done: boolean) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const id = crypto.randomUUID()
  const { error } = await supabase.from('habit_logs').upsert(
    { id, habit_id: habitId, user_id: user.id, date, done },
    { onConflict: 'habit_id,date' }
  )
  if (error) throw error
  revalidatePath('/habits')
}

export async function getHabitsWithTodayLogs() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const today = getTodayISO()

  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: true })

  if (!habits?.length) return []

  const { data: logs } = await supabase
    .from('habit_logs')
    .select('*')
    .in('habit_id', habits.map((h) => h.id))
    .eq('date', today)

  const logMap = new Map(logs?.map((l) => [l.habit_id, l]) ?? [])

  return habits.map((habit) => ({
    ...habit,
    todayLog: logMap.get(habit.id) ?? null,
    todayDone: logMap.get(habit.id)?.done ?? false,
  }))
}

export async function getHabitStreak(habitId: string): Promise<number> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { data: logs } = await supabase
    .from('habit_logs')
    .select('date, done')
    .eq('habit_id', habitId)
    .eq('done', true)
    .order('date', { ascending: false })
    .limit(365)

  if (!logs?.length) return 0

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const logDates = new Set(logs.map((l) => l.date))

  for (let i = 0; i <= 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const iso = d.toISOString().split('T')[0]
    if (logDates.has(iso)) {
      streak++
    } else {
      // Allow today to be incomplete without breaking streak
      if (i === 0) continue
      break
    }
  }

  return streak
}
