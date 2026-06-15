'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  reward: { title: string; points_required: number } | null
  onClose: () => void
}

export function RewardUnlockModal({ reward, onClose }: Props) {
  if (!reward) return null

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl">🏆 Reward Unlocked!</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="text-6xl">🎉</div>
          <div>
            <p className="text-xl font-bold">{reward.title}</p>
            <p className="text-sm text-muted-foreground mt-1">
              You earned {reward.points_required}+ points this week!
            </p>
          </div>
          <p className="text-muted-foreground text-sm">
            You set this reward for yourself — go enjoy it, you earned it!
          </p>
          <Button onClick={onClose} className="w-full" size="lg">
            Enjoy it! 🎊
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
