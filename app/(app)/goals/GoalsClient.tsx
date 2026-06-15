'use client'

import { useState } from 'react'
import { GoalCard } from '@/components/goals/GoalCard'
import { PointsBar } from '@/components/goals/PointsBar'
import { RewardUnlockModal } from '@/components/goals/RewardUnlockModal'
import { CreateGoalDialog } from '@/components/goals/CreateGoalDialog'
import { SetRewardDialog } from '@/components/goals/SetRewardDialog'
import { Card } from '@/components/ui/card'

interface Goal {
  id: string
  title: string
  points: 1 | 2
  status: 'pending' | 'completed'
}

interface Reward {
  id: string
  title: string
  points_required: number
  unlocked_at: string | null
}

interface Props {
  goals: Goal[]
  reward: Reward | null
  earnedPoints: number
  weekStart: string
}

export function GoalsClient({ goals, reward, earnedPoints, weekStart }: Props) {
  const [unlockedReward, setUnlockedReward] = useState<{
    title: string
    points_required: number
  } | null>(null)

  const weekLabel = new Date(weekStart + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <>
      {unlockedReward && (
        <RewardUnlockModal
          reward={unlockedReward}
          onClose={() => setUnlockedReward(null)}
        />
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Weekly Goals</h1>
            <p className="text-sm text-muted-foreground">Week of {weekLabel}</p>
          </div>
          <CreateGoalDialog />
        </div>

        {reward ? (
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  This Week&apos;s Reward
                </p>
                <p className="font-semibold">{reward.title}</p>
              </div>
              <SetRewardDialog currentReward={reward} />
            </div>
            {reward.unlocked_at ? (
              <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-3 text-center">
                <p className="text-yellow-600 dark:text-yellow-400 font-semibold">
                  🏆 Reward unlocked! Go enjoy it!
                </p>
              </div>
            ) : (
              <PointsBar
                earned={earnedPoints}
                required={reward.points_required}
                unlocked={!!reward.unlocked_at}
              />
            )}
          </Card>
        ) : (
          <Card className="p-4 border-dashed">
            <div className="text-center space-y-2">
              <p className="text-2xl">🎁</p>
              <p className="text-sm font-medium">No reward set for this week</p>
              <p className="text-xs text-muted-foreground">
                Set a reward to unlock when you hit your point goal
              </p>
              <SetRewardDialog currentReward={null} />
            </div>
          </Card>
        )}

        {goals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-4xl mb-3">🎯</p>
            <p className="font-medium">No goals this week</p>
            <p className="text-sm">Add weekly goals to earn points toward your reward</p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                id={goal.id}
                title={goal.title}
                points={goal.points}
                status={goal.status}
                onRewardUnlocked={setUnlockedReward}
              />
            ))}
          </div>
        )}

        {goals.length > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            {earnedPoints} pts earned · {goals.filter((g) => g.status === 'completed').length}/{goals.length} goals done
          </p>
        )}
      </div>
    </>
  )
}
