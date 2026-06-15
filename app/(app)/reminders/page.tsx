import { getReminders } from '@/actions/reminders'
import { RemindersClient } from './RemindersClient'

export default async function RemindersPage() {
  const reminders = await getReminders()
  return <RemindersClient initialReminders={reminders as never} />
}
