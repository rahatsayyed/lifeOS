import { getWeekSummary } from '@/actions/goals'
import { GoalsClient } from './GoalsClient'

export default async function GoalsPage() {
  const summary = await getWeekSummary()

  if (!summary) return null

  return (
    <GoalsClient
      goals={summary.goals as { id: string; title: string; points: 1 | 2; status: 'pending' | 'completed' }[]}
      reward={summary.reward}
      earnedPoints={summary.earnedPoints}
      weekStart={summary.weekStart}
    />
  )
}
