'use client'

import { useState, useTransition } from 'react'
import { Card } from '@/components/ui/card'
import { Flame, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logHabit, deleteHabit } from '@/actions/habits'
import { getTodayISO } from '@/lib/utils/dates'
import { toast } from 'sonner'

interface Props {
  id: string
  name: string
  icon: string
  color: string
  streak: number
  todayDone: boolean
}

export function HabitCard({ id, name, icon, color, streak, todayDone }: Props) {
  const [done, setDone] = useState(todayDone)
  const [isPending, startTransition] = useTransition()

  function toggle() {
    const newDone = !done
    setDone(newDone) // optimistic

    startTransition(async () => {
      try {
        await logHabit(id, getTodayISO(), newDone)
      } catch {
        setDone(!newDone) // revert
        toast.error('Failed to update habit')
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteHabit(id)
        toast.success('Habit deleted')
      } catch {
        toast.error('Failed to delete habit')
      }
    })
  }

  return (
    <Card
      className={cn(
        'flex items-center gap-4 px-4 py-3 cursor-pointer transition-all',
        done && 'opacity-75'
      )}
    >
      <button
        onClick={toggle}
        disabled={isPending}
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all shrink-0',
          done
            ? 'ring-2 ring-offset-2 scale-95'
            : 'ring-2 ring-border hover:ring-offset-1'
        )}
        style={{
          backgroundColor: done ? color : 'transparent',
          borderColor: color,
        }}
      >
        {icon}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn('font-medium truncate', done && 'line-through text-muted-foreground')}>
          {name}
        </p>
        {streak > 0 && (
          <div className="flex items-center gap-1 text-xs text-orange-500">
            <Flame className="w-3 h-3" />
            <span>{streak} day streak</span>
          </div>
        )}
      </div>

      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-muted-foreground hover:text-destructive transition-colors p-1"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </Card>
  )
}
