'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { createGoal } from '@/actions/goals'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function CreateGoalDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [points, setPoints] = useState<1 | 2>(1)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    startTransition(async () => {
      try {
        await createGoal({ title: title.trim(), points })
        setOpen(false)
        setTitle('')
        setPoints(1)
        toast.success('Goal added!')
      } catch {
        toast.error('Failed to create goal')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="gap-1" />}>
        <Plus className="w-4 h-4" /> Add Goal
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New Weekly Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="goal-title">Goal</Label>
            <Input
              id="goal-title"
              placeholder="e.g. Exercise 3 times"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>Points</Label>
            <div className="flex gap-2">
              {([1, 2] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPoints(p)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all',
                    points === p
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-muted-foreground'
                  )}
                >
                  {p} {p === 1 ? 'point' : 'points'}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              2 points for harder or more impactful goals
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isPending || !title.trim()}>
            {isPending ? 'Adding...' : 'Add Goal'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
