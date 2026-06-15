// Returns the Monday of the week containing the given date as YYYY-MM-DD
export function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  // Sunday = 0, Monday = 1, ... adjust so Monday is start
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

export function getCurrentWeekStart(): string {
  return getWeekStart(new Date())
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function isToday(isoDate: string): boolean {
  return isoDate === getTodayISO()
}
