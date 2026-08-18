'use client'

import { Archive, ArchiveRestore } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Staff } from '@/lib/staff-data'

export function ArchiveStaffDialog({
  person,
  onCancel,
  onConfirm,
}: {
  person: Staff
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-xl">
        <div className="mb-4 grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
          <Archive className="size-5" />
        </div>
        <h2 className="text-lg font-semibold">Archive staff record?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This moves <span className="font-medium text-foreground">{person.name}</span> ({person.staffId}) out of the staff directory. You can restore it from Archive at any time.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Archive staff</Button>
        </div>
      </div>
    </div>
  )
}

export function UnarchiveStaffDialog({
  person,
  onCancel,
  onConfirm,
}: {
  person: Staff
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-xl">
        <div className="mb-4 grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
          <ArchiveRestore className="size-5" />
        </div>
        <h2 className="text-lg font-semibold">Restore staff record?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This returns <span className="font-medium text-foreground">{person.name}</span> ({person.staffId}) to the staff directory.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Restore staff</Button>
        </div>
      </div>
    </div>
  )
}
