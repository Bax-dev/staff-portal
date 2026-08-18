'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, Search, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { auditApi } from '@/lib/api'
import type { AuditAction, AuditLog } from '@/lib/api/types'
import { ApiError } from '@/lib/api/client'

const actions: Array<{ value: '' | AuditAction; label: string }> = [
  { value: '', label: 'All actions' },
  { value: 'CREATE', label: 'Created' },
  { value: 'UPDATE', label: 'Updated' },
  { value: 'DELETE', label: 'Removed' },
  { value: 'LOGIN', label: 'Signed in' },
  { value: 'IMPORT', label: 'Imported' },
  { value: 'ARCHIVE', label: 'Archived' },
  { value: 'UNARCHIVE', label: 'Restored' },
]

const entityTypes = [
  'Staff',
  'Document',
  'Education',
  'Certification',
  'Family member',
  'Emergency contact',
  'Next of kin',
  'Service history',
  'Settings',
  'User',
]

const actionStyles: Record<AuditAction, string> = {
  CREATE: 'bg-primary/10 text-primary',
  UPDATE: 'bg-muted text-foreground',
  DELETE: 'bg-destructive/10 text-destructive',
  LOGIN: 'bg-primary/10 text-primary',
  IMPORT: 'bg-primary/10 text-primary',
  ARCHIVE: 'bg-muted text-foreground',
  UNARCHIVE: 'bg-primary/10 text-primary',
}

const actionLabels: Record<AuditAction, string> = {
  CREATE: 'Created',
  UPDATE: 'Updated',
  DELETE: 'Removed',
  LOGIN: 'Signed in',
  IMPORT: 'Imported',
  ARCHIVE: 'Archived',
  UNARCHIVE: 'Restored',
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [query, setQuery] = useState('')
  const [action, setAction] = useState<'' | AuditAction>('')
  const [entityType, setEntityType] = useState('')
  const [reloadToken, setReloadToken] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const handle = window.setTimeout(() => {
      setIsLoading(true)
      setError(null)

      auditApi
        .list({
          query,
          action: action || undefined,
          entityType: entityType || undefined,
        })
        .then((records) => {
          if (!cancelled) setLogs(records)
        })
        .catch((caught: unknown) => {
          if (cancelled) return
          setLogs([])
          setError(caught instanceof ApiError || caught instanceof Error ? caught.message : 'Could not load audit events.')
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false)
        })
    }, query ? 250 : 0)

    return () => {
      cancelled = true
      window.clearTimeout(handle)
    }
  }, [query, action, entityType, reloadToken])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-sm text-muted-foreground">{isLoading ? 'Loading events' : `${logs.length} recent events`}</p>
          <h2 className="text-3xl font-semibold tracking-tight">Audit log</h2>
          <p className="mt-2 text-sm text-muted-foreground">Track who changed staff records, documents, settings and access.</p>
        </div>
        <Button variant="outline" onClick={() => setReloadToken((current) => current + 1)} disabled={isLoading}>
          <RefreshCw data-icon="inline-start" />
          Refresh
        </Button>
      </div>
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            aria-label="Search audit log"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by person, action or record"
            className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="relative min-w-44">
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <select
            aria-label="Filter action"
            value={action}
            onChange={(event) => setAction(event.target.value as '' | AuditAction)}
            className="h-10 w-full appearance-none rounded-lg border bg-background pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            {actions.map((item) => (
              <option key={item.label} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="relative min-w-52">
          <select
            aria-label="Filter record type"
            value={entityType}
            onChange={(event) => setEntityType(event.target.value)}
            className="h-10 w-full appearance-none rounded-lg border bg-background px-3 pr-8 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All record types</option>
            {entityTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">When</th>
                <th className="px-5 py-3 font-medium">Actor</th>
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="px-5 py-3 font-medium">Record</th>
                <th className="px-5 py-3 font-medium">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30">
                  <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">{formatDateTime(log.createdAt)}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium">{log.actorName}</p>
                    <p className="text-xs text-muted-foreground">{log.actorEmail ?? 'System event'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${actionStyles[log.action]}`}>
                      {actionLabels[log.action]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    <p>{log.entityType}</p>
                    {log.entityId && <p className="truncate text-xs">{log.entityId}</p>}
                  </td>
                  <td className="px-5 py-4">{log.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {isLoading ? 'Loading audit events…' : error ?? 'No audit events match your filters yet.'}
          </div>
        )}
      </div>
    </div>
  )
}
