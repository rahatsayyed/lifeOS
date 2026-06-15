'use client'

import { useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'

export function useRealtimeSubscription(
  table: string,
  filter: string | undefined,
  onUpdate: (payload: unknown) => void
) {
  useEffect(() => {
    const supabase = getSupabaseClient()
    const channelName = `realtime:${table}:${filter ?? 'all'}`

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          ...(filter ? { filter } : {}),
        },
        onUpdate
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter, onUpdate])
}
