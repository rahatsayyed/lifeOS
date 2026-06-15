'use client'

import { useState, useTransition } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Trash2, Plus, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createTask, updateTaskStatus, deleteTask } from '@/actions/tasks'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils/dates'

type Task = {
  id: string
  title: string
  description: string | null
  due_date: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'done'
}

const PRIORITY_COLORS = {
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  high: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
}

function TaskItem({ task, onDelete }: { task: Task; onDelete: (id: string) => void }) {
  const [status, setStatus] = useState(task.status)
  const [isPending, startTransition] = useTransition()

  function cycleStatus() {
    const next: Task['status'] = status === 'todo' ? 'in_progress' : status === 'in_progress' ? 'done' : 'todo'
    setStatus(next)
    startTransition(async () => {
      try {
        await updateTaskStatus(task.id, next)
      } catch {
        setStatus(status)
        toast.error('Failed to update task')
      }
    })
  }

  const statusIcon = status === 'done' ? '✓' : status === 'in_progress' ? '◐' : '○'

  return (
    <Card className={cn('px-4 py-3 flex items-start gap-3', status === 'done' && 'opacity-60')}>
      <button
        onClick={cycleStatus}
        disabled={isPending}
        className={cn(
          'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs shrink-0 transition-all',
          status === 'done' && 'bg-primary border-primary text-primary-foreground',
          status === 'in_progress' && 'border-yellow-500 text-yellow-500',
          status === 'todo' && 'border-muted-foreground'
        )}
      >
        {status === 'done' && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {status === 'in_progress' && <div className="w-2 h-2 rounded-full bg-yellow-500" />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn('font-medium text-sm', status === 'done' && 'line-through text-muted-foreground')}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', PRIORITY_COLORS[task.priority])}>
            {task.priority}
          </span>
          {task.due_date && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(task.due_date)}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onDelete(task.id)}
        disabled={isPending}
        className="text-muted-foreground hover:text-destructive transition-colors p-1 shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </Card>
  )
}

function CreateTaskDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    startTransition(async () => {
      try {
        await createTask({
          title: title.trim(),
          description: description.trim() || undefined,
          due_date: dueDate || undefined,
          priority,
        })
        setOpen(false)
        setTitle('')
        setDescription('')
        setDueDate('')
        setPriority('medium')
        toast.success('Task added!')
      } catch {
        toast.error('Failed to create task')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="gap-1" />}>
        <Plus className="w-4 h-4" /> Add Task
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input placeholder="What needs to be done?" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label>Description (optional)</Label>
            <Input placeholder="Add details..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Due date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <div className="flex gap-1">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      'flex-1 py-1.5 rounded text-xs font-medium border transition-all',
                      priority === p ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                    )}
                  >
                    {p[0].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isPending || !title.trim()}>
            {isPending ? 'Adding...' : 'Add Task'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface Props {
  initialTasks: Task[]
}

export function TasksClient({ initialTasks }: Props) {
  const [tasks, setTasks] = useState(initialTasks)
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all')
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    startTransition(async () => {
      try {
        await deleteTask(id)
        toast.success('Task deleted')
      } catch {
        setTasks(initialTasks)
        toast.error('Failed to delete task')
      }
    })
  }

  const filtered = tasks.filter((t) => {
    if (filter === 'todo') return t.status !== 'done'
    if (filter === 'done') return t.status === 'done'
    return true
  })

  const todoCount = tasks.filter((t) => t.status !== 'done').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-sm text-muted-foreground">{todoCount} remaining</p>
        </div>
        <CreateTaskDialog />
      </div>

      <div className="flex gap-2">
        {(['all', 'todo', 'done'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            {f === 'all' ? 'All' : f === 'todo' ? 'Active' : 'Done'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-3">✅</p>
          <p className="font-medium">{filter === 'done' ? 'Nothing completed yet' : 'All clear!'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => (
            <TaskItem key={task.id} task={task} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
