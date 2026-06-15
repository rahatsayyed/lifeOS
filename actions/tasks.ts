'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTask(data: {
  title: string
  description?: string
  due_date?: string
  priority: 'low' | 'medium' | 'high'
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const id = crypto.randomUUID()
  const { error } = await supabase.from('tasks').insert({
    id,
    owner_id: user.id,
    title: data.title,
    description: data.description ?? null,
    due_date: data.due_date ?? null,
    priority: data.priority,
    status: 'todo',
  })
  if (error) throw error
  revalidatePath('/tasks')
  return id
}

export async function updateTaskStatus(id: string, status: 'todo' | 'in_progress' | 'done') {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', id)
    .eq('owner_id', user.id)
  if (error) throw error
  revalidatePath('/tasks')
}

export async function deleteTask(id: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)
  if (error) throw error
  revalidatePath('/tasks')
}

export async function getTasks(filter?: {
  status?: 'todo' | 'in_progress' | 'done'
  priority?: 'low' | 'medium' | 'high'
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('tasks')
    .select('*')
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false })

  if (filter?.status) query = query.eq('status', filter.status)
  if (filter?.priority) query = query.eq('priority', filter.priority)

  const { data } = await query
  return data ?? []
}
