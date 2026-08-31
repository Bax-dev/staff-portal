'use client'

import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { StaffAccount } from '@/lib/api/types'

export function DeleteAccountDialog({
  account,
  onCancel,
  onConfirm,
}: {
  account: StaffAccount
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-xl">
        <div className="mb-4 grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert className="size-5" />
        </div>
        <h2 className="text-lg font-semibold">Delete this login?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {account.staffName ?? account.name} ({account.email}) will no longer be able to sign in. This does not remove their staff record.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete login
          </Button>
        </div>
      </div>
    </div>
  )
}
