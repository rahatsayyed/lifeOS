'use client'

import { useCallback, useEffect } from 'react'
import { db, type SyncQueueItem } from '@/lib/dexie/db'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useNetworkStatus } from './useNetworkStatus'
import { v4 as uuidv4 } from 'uuid'

async function flushQueue() {
  const supabase = getSupabaseClient()
  const pending = await db.sync_queue
    .where('synced')
    .equals(0) // Dexie stores booleans as 0/1
    .sortBy('timestamp')

  for (const item of pending) {
    try {
      if (item.operation === 'insert' || item.operation === 'update') {
        const { error } = await supabase
          .from(item.table as never)
          .upsert(item.payload as never, { onConflict: 'id' })
        if (error) throw error
      } else if (item.operation === 'delete') {
        const { error } = await supabase
          .from(item.table as never)
          .delete()
          .eq('id', item.payload.id as string)
        if (error) throw error
      }
      await db.sync_queue.update(item.id, { synced: true })
    } catch {
      // Will retry on next flush
    }
  }
}

export function useOfflineSync() {
  const isOnline = useNetworkStatus()

  useEffect(() => {
    if (isOnline) {
      flushQueue()
    }
  }, [isOnline])

  const queueAndSync = useCallback(
    async (
      table: string,
      operation: SyncQueueItem['operation'],
      payload: Record<string, unknown>
    ) => {
      const queueItem: SyncQueueItem = {
        id: uuidv4(),
        table,
        operation,
        payload,
        timestamp: Date.now(),
        synced: false,
      }

      await db.sync_queue.add(queueItem)

      if (isOnline) {
        const supabase = getSupabaseClient()
        try {
          if (operation === 'insert' || operation === 'update') {
            await supabase
              .from(table as never)
              .upsert(payload as never, { onConflict: 'id' })
          } else if (operation === 'delete') {
            await supabase
              .from(table as never)
              .delete()
              .eq('id', payload.id as string)
          }
          await db.sync_queue.update(queueItem.id, { synced: true })
        } catch {
          // Will be retried on reconnect
        }
      }
    },
    [isOnline]
  )

  return { queueAndSync, isOnline }
}
