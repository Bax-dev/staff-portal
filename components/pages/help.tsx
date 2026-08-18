'use client'

import Link from 'next/link'
import { HelpCircle, Map } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTour } from '@/lib/tour-context'

export function Help() {
  const { start } = useTour()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-sm text-muted-foreground">Support and guidance</p>
          <h2 className="text-3xl font-semibold tracking-tight">Help center</h2>
          <p className="mt-2 text-sm text-muted-foreground">Everything you need to manage the staff register.</p>
        </div>
        <Button variant="outline" onClick={start}>
          <Map data-icon="inline-start" />
          Take a tour
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Importing data', 'Upload a CSV or XLSX file with a header row.'],
          ['Exporting records', 'Use CSV for sharing or XLSX for structured workbooks.'],
          ['Managing staff', 'Open any record to review the personnel profile.'],
        ].map(([title, description]) => (
          <div key={title} className="rounded-xl border bg-card p-5">
            <HelpCircle className="mb-8 size-5 text-primary" />
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-fit" nativeButton={false} render={<Link href="/staff" />}>
        Open staff directory
      </Button>
    </div>
  )
}
