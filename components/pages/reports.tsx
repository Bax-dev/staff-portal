'use client'

import { ArrowDownToLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStaff } from '@/lib/staff-context'

export function Reports() {
  const { staff, exportXlsx } = useStaff()
  const byDepartment = staff.reduce<Record<string, number>>((result, person) => {
    result[person.department] = (result[person.department] || 0) + 1
    return result
  }, {})

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="mb-2 text-sm text-muted-foreground">Workforce intelligence</p>
          <h2 className="text-3xl font-semibold tracking-tight">Reports</h2>
          <p className="mt-2 text-sm text-muted-foreground">Quick summaries from your current staff register.</p>
        </div>
        <Button variant="outline" onClick={exportXlsx}>
          <ArrowDownToLine data-icon="inline-start" />
          Download XLSX
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Active', staff.filter((p) => p.status === 'Active').length],
          ['Female', staff.filter((p) => p.gender === 'Female').length],
          ['Male', staff.filter((p) => p.gender === 'Male').length],
          ['On leave', staff.filter((p) => p.status === 'On leave').length],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-4 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-semibold">Staff by department</h3>
        <div className="mt-5 flex flex-col gap-4">
          {Object.entries(byDepartment).map(([name, count]) => (
            <div key={name}>
              <div className="mb-2 flex justify-between text-sm">
                <span>{name}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(12, (count / staff.length) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
