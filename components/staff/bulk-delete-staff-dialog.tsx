'use client'

import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function BulkDeleteStaffDialog({ count, onCancel, onConfirm }: { count: number; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-xl">
        <div className="mb-4 grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert className="size-5" />
        </div>
        <h2 className="text-lg font-semibold">Remove {count} staff record{count === 1 ? '' : 's'}?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This removes the selected record{count === 1 ? '' : 's'} from the staff directory. Records are kept for audit and their staff IDs can be reused.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Remove {count === 1 ? 'record' : `${count} records`}
          </Button>
        </div>
      </div>
    </div>
  )
}
