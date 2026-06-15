'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentWeekStart } from '@/lib/utils/dates'

export async function createGoal(data: { title: string; points: 1 | 2 }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const id = crypto.randomUUID()
  const { error } = await supabase.from('weekly_goals').insert({
    id,
    owner_id: user.id,
    title: data.title,
    points: data.points,
    week_start_date: getCurrentWeekStart(),
    status: 'pending',
  })
  if (error) throw error
  revalidatePath('/goals')
  return id
}

export async function deleteGoal(id: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const { error } = await supabase
    .from('weekly_goals')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)
  if (error) throw error
  revalidatePath('/goals')
}

export async function completeGoal(goalId: string): Promise<{
  earnedPoints: number
  unlockedReward: { id: string; title: string; points_required: number } | null
}> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const weekStart = getCurrentWeekStart()

  // Mark goal completed
  const { error } = await supabase
    .from('weekly_goals')
    .update({ status: 'completed' })
    .eq('id', goalId)
    .eq('owner_id', user.id)
  if (error) throw error

  // Sum completed points for this week
  const { data: goals } = await supabase
    .from('weekly_goals')
    .select('points, status')
    .eq('owner_id', user.id)
    .eq('week_start_date', weekStart)

  const earnedPoints = (goals ?? [])
    .filter((g) => g.status === 'completed')
    .reduce((sum, g) => sum + g.points, 0)

  // Check if reward threshold is met
  const { data: reward } = await supabase
    .from('rewards')
    .select('id, title, points_required')
    .eq('owner_id', user.id)
    .eq('week_start_date', weekStart)
    .is('unlocked_at', null)
    .lte('points_required', earnedPoints)
    .order('points_required', { ascending: true })
    .limit(1)
    .maybeSingle()

  let unlockedReward = null
  if (reward) {
    await supabase
      .from('rewards')
      .update({ unlocked_at: new Date().toISOString() })
      .eq('id', reward.id)
    unlockedReward = reward
  }

  revalidatePath('/goals')
  return { earnedPoints, unlockedReward }
}

export async function uncompleteGoal(goalId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const { error } = await supabase
    .from('weekly_goals')
    .update({ status: 'pending' })
    .eq('id', goalId)
    .eq('owner_id', user.id)
  if (error) throw error
  revalidatePath('/goals')
}

export async function createReward(data: { title: string; points_required: number }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const weekStart = getCurrentWeekStart()
  const id = crypto.randomUUID()

  const { error } = await supabase.from('rewards').upsert({
    id,
    owner_id: user.id,
    title: data.title,
    points_required: data.points_required,
    week_start_date: weekStart,
    unlocked_at: null,
  }, { onConflict: 'owner_id,week_start_date' })
  if (error) throw error
  revalidatePath('/goals')
}

export async function getWeekSummary() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const weekStart = getCurrentWeekStart()

  const [{ data: goals }, { data: reward }] = await Promise.all([
    supabase
      .from('weekly_goals')
      .select('*')
      .eq('owner_id', user.id)
      .eq('week_start_date', weekStart)
      .order('updated_at', { ascending: true }),
    supabase
      .from('rewards')
      .select('*')
      .eq('owner_id', user.id)
      .eq('week_start_date', weekStart)
      .maybeSingle(),
  ])

  const earnedPoints = (goals ?? [])
    .filter((g) => g.status === 'completed')
    .reduce((sum, g) => sum + g.points, 0)

  return {
    goals: goals ?? [],
    reward: reward ?? null,
    earnedPoints,
    weekStart,
  }
}
