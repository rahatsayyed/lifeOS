import { getCurrentUser } from '@/actions/connections'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { ChevronRight, Users, LogOut } from 'lucide-react'
import { SignOutButton } from './SignOutButton'

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            user.name[0]?.toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{user.name}</p>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        </div>
      </Card>

      <div className="space-y-2">
        <Link href="/settings/connections">
          <Card className="p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer">
            <Users className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 font-medium">Connections</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Card>
        </Link>
      </div>

      <SignOutButton />
    </div>
  )
}
