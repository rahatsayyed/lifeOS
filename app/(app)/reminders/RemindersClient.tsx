'use client'

import { useState, useTransition } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus, Bell, BellOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createReminder, deleteReminder } from '@/actions/reminders'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { toast } from 'sonner'
import { formatDateTime } from '@/lib/utils/dates'

type Reminder = {
  id: string
  title: string
  remind_at: string
  repeat: 'none' | 'daily' | 'weekly'
  done: boolean
}

function toLocalDateTimeString(isoString: string) {
  const d = new Date(isoString)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function CreateReminderDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [remindAt, setRemindAt] = useState('')
  const [repeat, setRepeat] = useState<'none' | 'daily' | 'weekly'>('none')
  const [isPending, startTransition] = useTransition()
  const { permission, subscribed, requestAndSubscribe } = usePushNotifications()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !remindAt) return
    startTransition(async () => {
      try {
        await createReminder({
          title: title.trim(),
          remind_at: new Date(remindAt).toISOString(),
          repeat,
        })
        setOpen(false)
        setTitle('')
        setRemindAt('')
        setRepeat('none')
        toast.success('Reminder set!')
      } catch {
        toast.error('Failed to create reminder')
      }
    })
  }

  async function handleEnableNotifications() {
    const success = await requestAndSubscribe()
    if (success) toast.success('Notifications enabled!')
    else toast.error('Could not enable notifications')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="gap-1" />}>
        <Plus className="w-4 h-4" /> Add Reminder
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>New Reminder</DialogTitle></DialogHeader>

        {permission !== 'granted' && (
          <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-3 text-sm flex items-start gap-2">
            <BellOff className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Notifications not enabled</p>
              <button onClick={handleEnableNotifications} className="text-yellow-700 dark:text-yellow-300 underline text-xs mt-0.5">
                Enable push notifications
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Reminder</Label>
            <Input placeholder="What to remind you?" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label>When</Label>
            <Input type="datetime-local" value={remindAt} onChange={(e) => setRemindAt(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Repeat</Label>
            <div className="flex gap-2">
              {(['none', 'daily', 'weekly'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRepeat(r)}
                  className={cn(
                    'flex-1 py-1.5 rounded text-xs font-medium border transition-all',
                    repeat === r ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                  )}
                >
                  {r === 'none' ? 'Once' : r[0].toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isPending || !title.trim() || !remindAt}>
            {isPending ? 'Setting...' : 'Set Reminder'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface Props { initialReminders: Reminder[] }

export function RemindersClient({ initialReminders }: Props) {
  const [reminders, setReminders] = useState(initialReminders)
  const [isPending, startTransition] = useTransition()
  const { permission, subscribed, requestAndSubscribe } = usePushNotifications()

  function handleDelete(id: string) {
    setReminders((prev) => prev.filter((r) => r.id !== id))
    startTransition(async () => {
      try {
        await deleteReminder(id)
      } catch {
        setReminders(initialReminders)
        toast.error('Failed to delete')
      }
    })
  }

  const upcoming = reminders.filter((r) => !r.done)
  const past = reminders.filter((r) => r.done)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reminders</h1>
          <p className="text-sm text-muted-foreground">{upcoming.length} upcoming</p>
        </div>
        <CreateReminderDialog />
      </div>

      {permission !== 'granted' && (
        <Card className="p-3 flex items-start gap-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <BellOff className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Push notifications disabled</p>
            <button
              onClick={() => requestAndSubscribe().then((ok) => ok && toast.success('Notifications enabled!'))}
              className="text-yellow-700 dark:text-yellow-300 underline text-xs"
            >
              Enable to receive reminders
            </button>
          </div>
        </Card>
      )}

      {upcoming.length === 0 && past.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-3">🔔</p>
          <p className="font-medium">No reminders</p>
          <p className="text-sm">Add a reminder to get notified at the right time</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="space-y-3">
              {upcoming.map((r) => (
                <Card key={r.id} className="px-4 py-3 flex items-center gap-3">
                  <Bell className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(r.remind_at)}</p>
                  </div>
                  {r.repeat !== 'none' && (
                    <Badge variant="secondary" className="text-xs">{r.repeat}</Badge>
                  )}
                  <button onClick={() => handleDelete(r.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
