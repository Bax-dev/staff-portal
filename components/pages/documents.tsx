'use client'

import { ArrowDownToLine, ChevronRight, ClipboardList, FileText, FolderOpen, Upload, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStaff } from '@/lib/staff-context'

export function Documents() {
  const { triggerImport, exportXlsx } = useStaff()
  const cards: [string, string, LucideIcon][] = [
    ['Staff register', 'CSV or XLSX', FileText],
    ['Identity documents', 'Passport, NIN and certificates', FolderOpen],
    ['Service history', 'Promotions, postings, transfers and leave', ClipboardList],
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-sm text-muted-foreground">Records and uploads</p>
          <h2 className="text-3xl font-semibold tracking-tight">Documents</h2>
          <p className="mt-2 text-sm text-muted-foreground">Import staff registers and download structured workbooks.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={triggerImport}>
            <Upload data-icon="inline-start" />
            Upload file
          </Button>
          <Button onClick={exportXlsx}>
            <ArrowDownToLine data-icon="inline-start" />
            Download register
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(([title, description, Icon]) => (
          <div key={title} className="rounded-xl border bg-card p-5">
            <Icon className="mb-8 size-5 text-primary" />
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            <button onClick={title === 'Staff register' ? triggerImport : undefined} className="mt-5 text-xs font-semibold text-primary">
              {title === 'Staff register' ? 'Upload data' : 'View records'} <ChevronRight className="ml-1 inline size-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
