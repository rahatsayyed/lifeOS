'use client'

import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <Button variant="ghost" onClick={handleSignOut} className="w-full text-destructive gap-2">
      <LogOut className="w-4 h-4" />
      Sign out
    </Button>
  )
}
