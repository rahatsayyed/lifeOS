'use client'

import { useState, useTransition } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { completeGoal, uncompleteGoal, deleteGoal } from '@/actions/goals'
import { toast } from 'sonner'

interface Props {
  id: string
  title: string
  points: 1 | 2
  status: 'pending' | 'completed'
  onRewardUnlocked: (reward: { title: string; points_required: number }) => void
}

export function GoalCard({ id, title, points, status, onRewardUnlocked }: Props) {
  const [done, setDone] = useState(status === 'completed')
  const [isPending, startTransition] = useTransition()

  function toggle() {
    const newDone = !done
    setDone(newDone)

    startTransition(async () => {
      try {
        if (newDone) {
          const { unlockedReward } = await completeGoal(id)
          if (unlockedReward) {
            onRewardUnlocked(unlockedReward)
          }
        } else {
          await uncompleteGoal(id)
        }
      } catch {
        setDone(!newDone)
        toast.error('Failed to update goal')
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteGoal(id)
        toast.success('Goal removed')
      } catch {
        toast.error('Failed to delete goal')
      }
    })
  }

  return (
    <Card
      className={cn(
        'flex items-center gap-3 px-4 py-3 transition-all',
        done && 'opacity-70'
      )}
    >
      <button
        onClick={toggle}
        disabled={isPending}
        className={cn(
          'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
          done
            ? 'bg-primary border-primary text-primary-foreground'
            : 'border-muted-foreground hover:border-primary'
        )}
      >
        {done && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <p className={cn('flex-1 text-sm font-medium', done && 'line-through text-muted-foreground')}>
        {title}
      </p>

      <Badge
        variant={points === 2 ? 'default' : 'secondary'}
        className="shrink-0 text-xs"
      >
        {points}pt
      </Badge>

      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-muted-foreground hover:text-destructive transition-colors p-1 shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </Card>
  )
}
