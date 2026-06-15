'use client'

import { useState, useTransition } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Check, Link } from 'lucide-react'
import { sendConnectionRequest, acceptConnection } from '@/actions/connections'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type Partner = { id: string; name: string; email: string; avatar_url: string | null }
type Connection = { id: string; status: string; partner: Partner; isIncoming: boolean }

interface Props {
  pending: Connection[]
  accepted: Connection[]
}

export function ConnectionsClient({ pending, accepted }: Props) {
  const [email, setEmail] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    startTransition(async () => {
      try {
        await sendConnectionRequest(email.trim())
        setEmail('')
        toast.success('Connection request sent!')
        router.refresh()
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to send request')
      }
    })
  }

  function handleAccept(connectionId: string) {
    startTransition(async () => {
      try {
        await acceptConnection(connectionId)
        toast.success('Connection accepted!')
        router.refresh()
      } catch {
        toast.error('Failed to accept')
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Connections</h1>
        <p className="text-sm text-muted-foreground">Share your habits and goals with someone you trust</p>
      </div>

      <Card className="p-4 space-y-3">
        <p className="font-medium flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Invite someone
        </p>
        <form onSubmit={handleInvite} className="flex gap-2">
          <Input
            type="email"
            placeholder="their@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isPending || !email.trim()}>
            Send
          </Button>
        </form>
      </Card>

      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Pending</p>
          {pending.map((c) => (
            <Card key={c.id} className="px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                {c.partner?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{c.partner?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{c.partner?.email}</p>
              </div>
              {c.isIncoming ? (
                <Button size="sm" onClick={() => handleAccept(c.id)} disabled={isPending} className="gap-1">
                  <Check className="w-3 h-3" /> Accept
                </Button>
              ) : (
                <Badge variant="secondary">Pending</Badge>
              )}
            </Card>
          ))}
        </div>
      )}

      {accepted.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Connected</p>
          {accepted.map((c) => (
            <Card key={c.id} className="px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                {c.partner?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{c.partner?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{c.partner?.email}</p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-200">
                <Link className="w-3 h-3 mr-1" /> Connected
              </Badge>
            </Card>
          ))}
        </div>
      )}

      {pending.length === 0 && accepted.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-3xl mb-2">👥</p>
          <p className="text-sm">No connections yet</p>
        </div>
      )}
    </div>
  )
}
