'use client'

import { useNetworkStatus } from '@/hooks/useNetworkStatus'

export function OfflineBanner() {
  const isOnline = useNetworkStatus()

  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-950 text-center text-sm py-1.5 font-medium">
      You're offline — changes will sync when you reconnect
    </div>
  )
}
