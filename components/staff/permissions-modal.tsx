'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toastError } from '@/components/ui/toast'
import type { ScreenPermission, StaffAccount } from '@/lib/api/types'
import { allScreens, screenLabels } from '@/lib/staff-data'

function buildInitialPermissions(account: StaffAccount): Record<string, ScreenPermission> {
  const byScreen = new Map(account.permissions.map((permission) => [permission.screen, permission]))
  const result: Record<string, ScreenPermission> = {}
  for (const screen of allScreens) {
    result[screen] = byScreen.get(screen) ?? { screen, canView: false, canEdit: false, canDelete: false }
  }
  return result
}

export function PermissionsModal({
  account,
  onClose,
  onSave,
}: {
  account: StaffAccount
  onClose: () => void
  onSave: (id: string, permissions: ScreenPermission[]) => Promise<void>
}) {
  const [permissions, setPermissions] = useState<Record<string, ScreenPermission>>(() => buildInitialPermissions(account))
  const [isSaving, setIsSaving] = useState(false)

  function toggle(screen: string, capability: 'canView' | 'canEdit' | 'canDelete') {
    setPermissions((current) => {
      const entry = current[screen]
      const nextValue = !entry[capability]
      const next: ScreenPermission = { ...entry, [capability]: nextValue }
      // Edit and delete both imply view access.
      if ((capability === 'canEdit' || capability === 'canDelete') && nextValue) {
        next.canView = true
      }
      // Turning off view clears the capabilities that depend on it.
      if (capability === 'canView' && !nextValue) {
        next.canEdit = false
        next.canDelete = false
      }
      return { ...current, [screen]: next }
    })
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      await onSave(account.id, allScreens.map((screen) => permissions[screen]))
    } catch (error) {
      toastError(error, 'Could not save permissions.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4">
      <div className="w-full max-w-lg rounded-xl border bg-card shadow-xl">
        <div className="flex items-start justify-between border-b p-5">
          <div>
            <h2 className="text-lg font-semibold">Manage permissions</h2>
            <p className="mt-1 text-sm text-muted-foreground">{account.staffName ?? account.name} · {account.email}</p>
          </div>
          <button aria-label="Close permissions" onClick={onClose}>
            <X className="size-5 text-muted-foreground" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="pb-3 font-medium">Screen</th>
                <th className="pb-3 text-center font-medium">View</th>
                <th className="pb-3 text-center font-medium">Edit</th>
                <th className="pb-3 text-center font-medium">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {allScreens.map((screen) => (
                <tr key={screen}>
                  <td className="py-3 font-medium">{screenLabels[screen]}</td>
                  <td className="py-3 text-center">
                    <input
                      type="checkbox"
                      aria-label={`${screenLabels[screen]} view`}
                      checked={permissions[screen].canView}
                      onChange={() => toggle(screen, 'canView')}
                      className="size-4 rounded border-input accent-primary"
                    />
                  </td>
                  <td className="py-3 text-center">
                    <input
                      type="checkbox"
                      aria-label={`${screenLabels[screen]} edit`}
                      checked={permissions[screen].canEdit}
                      onChange={() => toggle(screen, 'canEdit')}
                      className="size-4 rounded border-input accent-primary"
                    />
                  </td>
                  <td className="py-3 text-center">
                    <input
                      type="checkbox"
                      aria-label={`${screenLabels[screen]} delete`}
                      checked={permissions[screen].canDelete}
                      onChange={() => toggle(screen, 'canDelete')}
                      className="size-4 rounded border-input accent-primary"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-2 border-t p-5">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}
