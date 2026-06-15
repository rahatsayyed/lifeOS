'use client'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface Props {
  earned: number
  required: number
  unlocked: boolean
}

export function PointsBar({ earned, required, unlocked }: Props) {
  const percent = Math.min((earned / required) * 100, 100)
  const hit = earned >= required

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">
          {earned} / {required} pts
        </span>
        {unlocked ? (
          <span className="text-yellow-500 font-semibold">🏆 Reward unlocked!</span>
        ) : hit ? (
          <span className="text-green-500 font-semibold">🎉 Threshold reached!</span>
        ) : (
          <span className="text-muted-foreground">{required - earned} pts to go</span>
        )}
      </div>
      <Progress
        value={percent}
        className={cn(
          'h-3 transition-all',
          hit && 'animate-pulse'
        )}
      />
    </div>
  )
}
