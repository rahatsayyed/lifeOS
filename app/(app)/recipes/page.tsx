import { getRecipes } from '@/actions/recipes'
import { RecipesClient } from './RecipesClient'

export default async function RecipesPage() {
  const recipes = await getRecipes()
  return <RecipesClient initialRecipes={recipes as never} />
}
