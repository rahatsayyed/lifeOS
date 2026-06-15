'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Gift } from 'lucide-react'
import { createReward } from '@/actions/goals'
import { toast } from 'sonner'

interface Props {
  currentReward: { title: string; points_required: number } | null
}

export function SetRewardDialog({ currentReward }: Props) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(currentReward?.title ?? '')
  const [pointsRequired, setPointsRequired] = useState(
    currentReward?.points_required?.toString() ?? '10'
  )
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const pts = parseInt(pointsRequired)
    if (!title.trim() || isNaN(pts) || pts < 1) return

    startTransition(async () => {
      try {
        await createReward({ title: title.trim(), points_required: pts })
        setOpen(false)
        toast.success('Reward set!')
      } catch {
        toast.error('Failed to set reward')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="gap-1" />}>
        <Gift className="w-4 h-4" />
        {currentReward ? 'Change Reward' : 'Set Reward'}
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Weekly Reward</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reward-title">What&apos;s your reward?</Label>
            <Input
              id="reward-title"
              placeholder="e.g. Buy a new book"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reward-pts">Unlock at (points)</Label>
            <Input
              id="reward-pts"
              type="number"
              min={1}
              max={100}
              value={pointsRequired}
              onChange={(e) => setPointsRequired(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              You&apos;ll unlock this reward when you earn this many points in a week
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isPending || !title.trim()}>
            {isPending ? 'Saving...' : 'Set Reward'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
