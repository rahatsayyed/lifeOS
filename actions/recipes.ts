'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type Ingredient = { name: string; amount: string; unit: string }

export async function createRecipe(data: {
  name: string
  description?: string
  ingredients: Ingredient[]
  cuisine?: string
  tags: string[]
  liked: boolean
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const id = crypto.randomUUID()
  const { error } = await supabase.from('recipes').insert({
    id,
    owner_id: user.id,
    name: data.name,
    description: data.description ?? null,
    ingredients: data.ingredients,
    cuisine: data.cuisine ?? null,
    tags: data.tags,
    liked: data.liked,
  })
  if (error) throw error
  revalidatePath('/recipes')
  return id
}

export async function toggleLiked(id: string, liked: boolean) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const { error } = await supabase
    .from('recipes')
    .update({ liked })
    .eq('id', id)
    .eq('owner_id', user.id)
  if (error) throw error
  revalidatePath('/recipes')
}

export async function deleteRecipe(id: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)
  if (error) throw error
  revalidatePath('/recipes')
}

export async function getRecipes(filter?: { tag?: string; liked?: boolean }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('recipes')
    .select('*')
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false })

  if (filter?.liked !== undefined) query = query.eq('liked', filter.liked)
  if (filter?.tag) query = query.contains('tags', [filter.tag])

  const { data } = await query
  return data ?? []
}
