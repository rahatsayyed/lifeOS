'use client'

import { useState, useTransition } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Heart, Trash2, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createRecipe, toggleLiked, deleteRecipe } from '@/actions/recipes'
import { toast } from 'sonner'

type Ingredient = { name: string; amount: string; unit: string }
type Recipe = {
  id: string
  name: string
  description: string | null
  ingredients: Ingredient[]
  cuisine: string | null
  tags: string[]
  liked: boolean
}

function RecipeCard({ recipe, onLike, onDelete, onClick }: {
  recipe: Recipe
  onLike: (id: string, liked: boolean) => void
  onDelete: (id: string) => void
  onClick: (r: Recipe) => void
}) {
  const [liked, setLiked] = useState(recipe.liked)
  const [isPending, startTransition] = useTransition()

  function handleLike(e: React.MouseEvent) {
    e.stopPropagation()
    const next = !liked
    setLiked(next)
    startTransition(async () => {
      try {
        await toggleLiked(recipe.id, next)
        onLike(recipe.id, next)
      } catch {
        setLiked(!next)
        toast.error('Failed to update')
      }
    })
  }

  return (
    <Card
      className="px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => onClick(recipe)}
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{recipe.name}</p>
        {recipe.cuisine && (
          <p className="text-xs text-muted-foreground">{recipe.cuisine}</p>
        )}
        {recipe.tags.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {recipe.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs py-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleLike}
          disabled={isPending}
          className={cn(
            'p-1.5 rounded-full transition-all',
            liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'
          )}
        >
          <Heart className={cn('w-4 h-4', liked && 'fill-current')} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(recipe.id) }}
          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Card>
  )
}

function CreateRecipeDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: '', unit: '' }])
  const [liked, setLiked] = useState(false)
  const [isPending, startTransition] = useTransition()

  function addTag() {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
      setTagInput('')
    }
  }

  function addIngredient() {
    setIngredients([...ingredients, { name: '', amount: '', unit: '' }])
  }

  function updateIngredient(i: number, field: keyof Ingredient, value: string) {
    setIngredients((prev) => prev.map((ing, idx) => idx === i ? { ...ing, [field]: value } : ing))
  }

  function removeIngredient(i: number) {
    setIngredients((prev) => prev.filter((_, idx) => idx !== i))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    startTransition(async () => {
      try {
        await createRecipe({
          name: name.trim(),
          description: description.trim() || undefined,
          ingredients: ingredients.filter((i) => i.name.trim()),
          cuisine: cuisine.trim() || undefined,
          tags,
          liked,
        })
        setOpen(false)
        setName(''); setDescription(''); setCuisine(''); setTags([])
        setIngredients([{ name: '', amount: '', unit: '' }])
        setLiked(false)
        toast.success('Recipe added!')
      } catch {
        toast.error('Failed to create recipe')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="gap-1" />}>
        <Plus className="w-4 h-4" /> Add Recipe
      </DialogTrigger>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>New Recipe</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input placeholder="Recipe name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Cuisine</Label>
              <Input placeholder="e.g. Indian" value={cuisine} onChange={(e) => setCuisine(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Tags</Label>
              <div className="flex gap-1">
                <Input
                  placeholder="Add tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                />
                <Button type="button" variant="outline" size="icon" onClick={addTag}>+</Button>
              </div>
            </div>
          </div>
          {tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea placeholder="Optional notes..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Ingredients</Label>
              <Button type="button" variant="outline" size="sm" onClick={addIngredient} className="h-7 text-xs">+ Add</Button>
            </div>
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input placeholder="Name" value={ing.name} onChange={(e) => updateIngredient(i, 'name', e.target.value)} className="flex-1" />
                <Input placeholder="Amt" value={ing.amount} onChange={(e) => updateIngredient(i, 'amount', e.target.value)} className="w-16" />
                <Input placeholder="Unit" value={ing.unit} onChange={(e) => updateIngredient(i, 'unit', e.target.value)} className="w-16" />
                {ingredients.length > 1 && (
                  <button type="button" onClick={() => removeIngredient(i)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLiked(!liked)}
              className={cn('p-1.5 rounded-full', liked ? 'text-red-500' : 'text-muted-foreground')}
            >
              <Heart className={cn('w-5 h-5', liked && 'fill-current')} />
            </button>
            <span className="text-sm">{liked ? 'Liked recipe' : 'Mark as liked'}</span>
          </div>
          <Button type="submit" className="w-full" disabled={isPending || !name.trim()}>
            {isPending ? 'Adding...' : 'Add Recipe'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RecipeDetail({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-xl">
        <SheetHeader>
          <SheetTitle className="text-left">{recipe.name}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-2 flex-wrap">
            {recipe.cuisine && <Badge variant="outline">{recipe.cuisine}</Badge>}
            {recipe.liked && <Badge className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">❤️ Liked</Badge>}
            {recipe.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
          {recipe.description && (
            <p className="text-sm text-muted-foreground">{recipe.description}</p>
          )}
          {recipe.ingredients.length > 0 && (
            <div>
              <p className="font-medium text-sm mb-2">Ingredients</p>
              <ul className="space-y-1.5">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-muted-foreground w-20 shrink-0">
                      {ing.amount} {ing.unit}
                    </span>
                    <span>{ing.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface Props { initialRecipes: Recipe[] }

export function RecipesClient({ initialRecipes }: Props) {
  const [recipes, setRecipes] = useState(initialRecipes)
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [likedOnly, setLikedOnly] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isPending, startTransition] = useTransition()

  const allTags = [...new Set(recipes.flatMap((r) => r.tags))]

  const filtered = recipes.filter((r) => {
    if (likedOnly && !r.liked) return false
    if (tagFilter && !r.tags.includes(tagFilter)) return false
    return true
  })

  function handleDelete(id: string) {
    setRecipes((prev) => prev.filter((r) => r.id !== id))
    startTransition(async () => {
      try {
        await deleteRecipe(id)
        toast.success('Recipe deleted')
      } catch {
        setRecipes(initialRecipes)
        toast.error('Failed to delete')
      }
    })
  }

  return (
    <>
      {selectedRecipe && <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Recipes</h1>
            <p className="text-sm text-muted-foreground">{recipes.length} saved</p>
          </div>
          <CreateRecipeDialog />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setLikedOnly(!likedOnly)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-colors',
              likedOnly ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-muted text-muted-foreground'
            )}
          >
            <Heart className={cn('w-3 h-3', likedOnly && 'fill-current')} /> Liked
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                tagFilter === tag ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="font-medium">No recipes yet</p>
            <p className="text-sm">Add your favourite recipes to keep track of them</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onLike={(id, liked) => setRecipes((prev) => prev.map((r) => r.id === id ? { ...r, liked } : r))}
                onDelete={handleDelete}
                onClick={setSelectedRecipe}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
