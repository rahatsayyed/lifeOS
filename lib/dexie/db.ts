import Dexie, { type Table } from 'dexie'

export interface LocalHabit {
  id: string
  owner_id: string
  name: string
  frequency: 'daily' | 'specific_days'
  days_of_week: number[] | null
  color: string
  icon: string
  updated_at: string
}

export interface LocalHabitLog {
  id: string
  habit_id: string
  user_id: string
  date: string
  done: boolean
  updated_at: string
}

export interface LocalWeeklyGoal {
  id: string
  owner_id: string
  title: string
  points: 1 | 2
  week_start_date: string
  status: 'pending' | 'completed'
  updated_at: string
}

export interface LocalReward {
  id: string
  owner_id: string
  title: string
  points_required: number
  week_start_date: string
  unlocked_at: string | null
  created_at: string
}

export interface LocalTask {
  id: string
  owner_id: string
  title: string
  description: string | null
  due_date: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'done'
  updated_at: string
}

export interface LocalRecipe {
  id: string
  owner_id: string
  name: string
  description: string | null
  ingredients: { name: string; amount: string; unit: string }[]
  cuisine: string | null
  tags: string[]
  liked: boolean
  updated_at: string
}

export interface LocalReminder {
  id: string
  owner_id: string
  title: string
  remind_at: string
  repeat: 'none' | 'daily' | 'weekly'
  done: boolean
  updated_at: string
}

export interface SyncQueueItem {
  id: string
  table: string
  operation: 'insert' | 'update' | 'delete'
  payload: Record<string, unknown>
  timestamp: number
  synced: boolean
}

class LifeOSDb extends Dexie {
  habits!: Table<LocalHabit>
  habit_logs!: Table<LocalHabitLog>
  weekly_goals!: Table<LocalWeeklyGoal>
  rewards!: Table<LocalReward>
  tasks!: Table<LocalTask>
  recipes!: Table<LocalRecipe>
  reminders!: Table<LocalReminder>
  sync_queue!: Table<SyncQueueItem>

  constructor() {
    super('life-os-db')
    this.version(1).stores({
      habits: 'id, owner_id',
      habit_logs: 'id, habit_id, user_id, date, [habit_id+date]',
      weekly_goals: 'id, owner_id, week_start_date, status',
      rewards: 'id, owner_id, week_start_date',
      tasks: 'id, owner_id, status, priority, due_date',
      recipes: 'id, owner_id, liked',
      reminders: 'id, owner_id, remind_at, done',
      sync_queue: 'id, table, synced, timestamp',
    })
  }
}

export const db = new LifeOSDb()
