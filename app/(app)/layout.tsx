import { BottomNav } from '@/components/shared/BottomNav'
import { OfflineBanner } from '@/components/shared/OfflineBanner'
import { Toaster } from '@/components/ui/sonner'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OfflineBanner />
      <main className="min-h-screen pb-20 pt-4">
        <div className="max-w-lg mx-auto px-4">
          {children}
        </div>
      </main>
      <BottomNav />
      <Toaster />
    </>
  )
}
