'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CheckSquare, Target, ListTodo, BookOpen, Bell, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/habits', label: 'Habits', icon: CheckSquare },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/recipes', label: 'Recipes', icon: BookOpen },
  { href: '/reminders', label: 'Reminders', icon: Bell },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-0',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-medium truncate">{label}</span>
            </Link>
          )
        })}
        <Link
          href="/settings"
          className={cn(
            'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-0',
            pathname.startsWith('/settings')
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Settings className="w-5 h-5 shrink-0" />
          <span className="text-[10px] font-medium truncate">Settings</span>
        </Link>
      </div>
    </nav>
  )
}
