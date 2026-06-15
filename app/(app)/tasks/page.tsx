import { getTasks } from '@/actions/tasks'
import { TasksClient } from './TasksClient'

export default async function TasksPage() {
  const tasks = await getTasks()
  return <TasksClient initialTasks={tasks as never} />
}
