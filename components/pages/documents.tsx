'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowDownToLine, ChevronRight, ClipboardList, FileText, FolderOpen, Trash2, Upload, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toastError } from '@/components/ui/toast'
import { StaffAvatar } from '@/components/staff/staff-avatar'
import { documentApi, inferFileMimeType, resolveMediaUrl, serviceHistoryApi, uploadFileToS3 } from '@/lib/api'
import { ApiError } from '@/lib/api/client'
import type { DocumentCategory, ServiceHistoryRecord, StaffDocument } from '@/lib/api/types'
import { useAuth } from '@/lib/auth-context'
import { formatDateLabel } from '@/lib/dates'
import { useStaff } from '@/lib/staff-context'

const cards: Array<{ title: string; description: string; category: DocumentCategory; icon: LucideIcon }> = [
  { title: 'Staff register', description: 'CSV or XLSX', category: 'STAFF_REGISTER', icon: FileText },
  { title: 'Identity documents', description: 'Passport, NIN and certificates', category: 'IDENTITY', icon: FolderOpen },
  { title: 'Service history', description: 'Promotions, postings, transfers and leave', category: 'SERVICE_HISTORY', icon: ClipboardList },
]

const historyLabels: Record<ServiceHistoryRecord['type'], string> = {
  PROMOTION: 'Promotion',
  POSTING: 'Posting',
  TRANSFER: 'Transfer',
  LEAVE: 'Leave',
}

function recordCountLabel(count: number) {
  return `${count} record${count === 1 ? '' : 's'}`
}

export function Documents() {
  const { staff, isLoading: staffLoading, triggerImport, exportCsv, exportXlsx, defaultExportFormat, dataVersion, selectStaff } = useStaff()
  const { hasPermission } = useAuth()
  const canEdit = hasPermission('DOCUMENTS', 'edit')
  const canDelete = hasPermission('DOCUMENTS', 'delete')
  const [documents, setDocuments] = useState<StaffDocument[]>([])
  const [serviceHistory, setServiceHistory] = useState<ServiceHistoryRecord[]>([])
  const [viewCategory, setViewCategory] = useState<DocumentCategory>('STAFF_REGISTER')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    const [records, history] = await Promise.all([documentApi.list(), serviceHistoryApi.listAll()])
    setDocuments(records)
    setServiceHistory(history)
  }, [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    load()
      .catch((caught: unknown) => {
        if (cancelled) return
        setDocuments([])
        setServiceHistory([])
        setError(caught instanceof ApiError || caught instanceof Error ? caught.message : 'Could not load documents.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [dataVersion, load])

  async function handleUpload(file: File) {
    const mimeType = inferFileMimeType(file)
    const key = await uploadFileToS3(file, {
      kind: 'document',
      fileName: file.name,
      mimeType,
      category: viewCategory,
    })
    await documentApi.create({
      category: viewCategory,
      title: file.name,
      fileName: file.name,
      fileUrl: key,
      mimeType,
    })
    await load()
  }

  const identityDocuments = documents.filter((doc) => doc.category === 'IDENTITY')
  const counts: Record<DocumentCategory, number> = {
    STAFF_REGISTER: staff.length,
    IDENTITY: identityDocuments.length,
    SERVICE_HISTORY: serviceHistory.length,
  }
  const tableTitle = cards.find((card) => card.category === viewCategory)?.title ?? 'Records'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-sm text-muted-foreground">Records and uploads</p>
          <h2 className="text-3xl font-semibold tracking-tight">Documents</h2>
          <p className="mt-2 text-sm text-muted-foreground">Import staff registers and upload identity or service records.</p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" onClick={triggerImport}>
              <Upload data-icon="inline-start" />
              Upload register
            </Button>
          )}
          <Button onClick={defaultExportFormat === 'CSV' ? exportCsv : exportXlsx}>
            <ArrowDownToLine data-icon="inline-start" />
            Download register
          </Button>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div data-tour="document-types" className="grid gap-4 md:grid-cols-3">
        {cards.map(({ title, description, category, icon: Icon }) => (
          <div
            key={title}
            className={`rounded-xl border bg-card p-5 ${viewCategory === category ? 'border-primary ring-2 ring-primary/20' : ''}`}
          >
            <button type="button" onClick={() => setViewCategory(category)} className="block w-full text-left">
              <Icon className="mb-8 size-5 text-primary" />
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  setViewCategory(category)
                  if (category === 'STAFF_REGISTER') {
                    triggerImport()
                    return
                  }
                  fileInputRef.current?.click()
                }}
                className="mt-5 text-xs font-semibold text-primary"
              >
                {category === 'STAFF_REGISTER' ? 'Upload data' : 'Upload file'} <ChevronRight className="ml-1 inline size-3" />
              </button>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              {isLoading || (category === 'STAFF_REGISTER' && staffLoading) ? '…' : recordCountLabel(counts[category])}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-card">
        <div className="border-b px-5 py-4">
          <h3 className="font-semibold">{tableTitle}</h3>
        </div>
        {viewCategory === 'STAFF_REGISTER' && (
          <div className="divide-y">
            {staff.map((person) => (
              <button
                key={person.id}
                type="button"
                onClick={() => selectStaff(person)}
                className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm hover:bg-muted/50"
              >
                <StaffAvatar name={person.name} photo={person.photo} className="size-9 text-xs" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{person.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{person.staffId} · {person.designation} · {person.department}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">{person.status}</span>
              </button>
            ))}
            {staff.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                {staffLoading ? 'Loading staff register…' : 'No staff records yet. Upload a CSV or XLSX register.'}
              </p>
            )}
          </div>
        )}
        {viewCategory === 'IDENTITY' && (
          <DocumentList
            documents={identityDocuments}
            isLoading={isLoading}
            emptyLabel="No identity documents uploaded yet."
            onReload={load}
            canDelete={canDelete}
          />
        )}
        {viewCategory === 'SERVICE_HISTORY' && (
          <div className="divide-y">
            {serviceHistory.map((record) => (
              <div key={record.id} className="px-5 py-3 text-sm">
                <p className="font-medium">{record.title}</p>
                <p className="text-xs text-muted-foreground">
                  {historyLabels[record.type]} · {record.staffName ?? record.staffCode ?? 'Staff'} · {formatDateLabel(record.effectiveDate)}
                </p>
              </div>
            ))}
            {serviceHistory.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                {isLoading ? 'Loading service history…' : 'No service history records yet.'}
              </p>
            )}
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) handleUpload(file).catch((caught: unknown) => toastError(caught, 'Upload failed.'))
          event.currentTarget.value = ''
        }}
      />
    </div>
  )
}

function DocumentList({
  documents,
  isLoading,
  emptyLabel,
  onReload,
  canDelete,
}: {
  documents: StaffDocument[]
  isLoading: boolean
  emptyLabel: string
  onReload: () => Promise<void>
  canDelete: boolean
}) {
  return (
    <div className="divide-y">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
          <div className="min-w-0">
            <p className="truncate font-medium">{doc.title}</p>
            <p className="text-xs text-muted-foreground">{doc.fileName}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label={`Download ${doc.title}`}
              onClick={() => {
                resolveMediaUrl(doc.fileUrl)
                  .then((url) => {
                    if (url) window.open(url, '_blank', 'noopener,noreferrer')
                  })
                  .catch((caught: unknown) => toastError(caught, 'Could not download this file.'))
              }}
              className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ArrowDownToLine className="size-4" />
            </button>
            {canDelete && (
              <button
                type="button"
                aria-label={`Remove ${doc.title}`}
                onClick={() => {
                  documentApi
                    .remove(doc.id)
                    .then(onReload)
                    .catch((caught: unknown) => toastError(caught, 'Could not remove this file.'))
                }}
                className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        </div>
      ))}
      {documents.length === 0 && (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">{isLoading ? 'Loading documents…' : emptyLabel}</p>
      )}
    </div>
  )
}
