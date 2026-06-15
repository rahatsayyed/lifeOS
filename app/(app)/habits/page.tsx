import { getHabitsWithTodayLogs, getHabitStreak } from '@/actions/habits'
import { HabitCard } from '@/components/habits/HabitCard'
import { CreateHabitDialog } from '@/components/habits/CreateHabitDialog'
import { formatDate, getTodayISO } from '@/lib/utils/dates'

export default async function HabitsPage() {
  const habits = await getHabitsWithTodayLogs()

  const habitsWithStreaks = await Promise.all(
    habits.map(async (h) => ({
      ...h,
      streak: await getHabitStreak(h.id),
    }))
  )

  const completedCount = habits.filter((h) => h.todayDone).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Habits</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(getTodayISO())} · {completedCount}/{habits.length} done
          </p>
        </div>
        <CreateHabitDialog />
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">🌱</p>
          <p className="font-medium">No habits yet</p>
          <p className="text-sm">Add your first habit to start building streaks</p>
        </div>
      ) : (
        <div className="space-y-3">
          {habitsWithStreaks.map((habit) => (
            <HabitCard
              key={habit.id}
              id={habit.id}
              name={habit.name}
              icon={habit.icon}
              color={habit.color}
              streak={habit.streak}
              todayDone={habit.todayDone}
            />
          ))}
        </div>
      )}
    </div>
  )
}
