'use client'

import { useEffect, useState } from 'react'
import { ArchiveRestore, Eye, Search, Trash2 } from 'lucide-react'
import { StaffAvatar } from '@/components/staff/staff-avatar'
import { staffApi } from '@/lib/api'
import { useStaff } from '@/lib/staff-context'
import type { Staff } from '@/lib/staff-data'

function formatArchivedAt(value?: string | null) {
  if (!value) return 'Archived'
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function ArchivePage() {
  const { selectStaff, requestUnarchive, requestDelete, dataVersion } = useStaff()
  const [records, setRecords] = useState<Staff[]>([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const handle = window.setTimeout(() => {
      setIsLoading(true)
      setError(null)
      staffApi
        .list({ query, archived: true })
        .then((staff) => {
          if (!cancelled) setRecords(staff)
        })
        .catch((caught: unknown) => {
          if (!cancelled) {
            setError(caught instanceof Error ? caught.message : 'Could not load archived records.')
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false)
        })
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(handle)
    }
  }, [query, dataVersion])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-sm text-muted-foreground">{records.length} archived records</p>
        <h2 className="text-3xl font-semibold tracking-tight">Archive</h2>
        <p className="mt-2 text-sm text-muted-foreground">Restore staff records to the directory, or remove them permanently.</p>
      </div>
      <div className="rounded-xl border bg-card p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            aria-label="Search archived staff"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search archived staff"
            className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">Staff member</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Designation</th>
                <th className="px-5 py-3 font-medium">Archived</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map((person) => (
                <tr key={person.id} className="hover:bg-muted/30">
                  <td className="px-5 py-4">
                    <button onClick={() => selectStaff(person)} className="flex items-center gap-3 text-left">
                      <StaffAvatar name={person.name} photo={person.photo} className="size-9 text-xs" />
                      <div>
                        <p className="font-medium">{person.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {person.staffId} · {person.email}
                        </p>
                      </div>
                    </button>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{person.department}</td>
                  <td className="px-5 py-4">{person.designation}</td>
                  <td className="px-5 py-4 text-muted-foreground">{formatArchivedAt(person.archivedAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button aria-label={`View ${person.name}`} onClick={() => selectStaff(person)} className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                        <Eye className="size-4" />
                      </button>
                      <button aria-label={`Restore ${person.name}`} onClick={() => requestUnarchive(person)} className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                        <ArchiveRestore className="size-4" />
                      </button>
                      <button aria-label={`Remove ${person.name}`} onClick={() => requestDelete(person)} className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {records.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {isLoading ? 'Loading archived records…' : error ?? 'No archived staff records yet.'}
          </div>
        )}
      </div>
    </div>
  )
}
