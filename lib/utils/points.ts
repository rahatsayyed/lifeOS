export function calculateEarnedPoints(
  goals: { points: 1 | 2; status: 'pending' | 'completed' }[]
): number {
  return goals
    .filter((g) => g.status === 'completed')
    .reduce((sum, g) => sum + g.points, 0)
}

export function getPointsProgress(earned: number, required: number): number {
  return Math.min((earned / required) * 100, 100)
}
