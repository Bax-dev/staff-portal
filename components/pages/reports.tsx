'use client'

import { ArrowDownToLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStaff } from '@/lib/staff-context'
import { toDateInputValue } from '@/lib/dates'
import type { Staff } from '@/lib/staff-data'

function countBy(list: Staff[], keyFn: (person: Staff) => string) {
  return list.reduce<Record<string, number>>((result, person) => {
    const key = keyFn(person)
    result[key] = (result[key] ?? 0) + 1
    return result
  }, {})
}

function yearsOfService(appointmentDate: string) {
  const iso = toDateInputValue(appointmentDate)
  if (!iso) return null
  const start = new Date(iso)
  const now = new Date()
  let years = now.getFullYear() - start.getFullYear()
  const monthDiff = now.getMonth() - start.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < start.getDate())) years -= 1
  return Math.max(years, 0)
}

const TENURE_BUCKETS: [string, (years: number) => boolean][] = [
  ['Under 1 year', (years) => years < 1],
  ['1–3 years', (years) => years >= 1 && years < 3],
  ['3–5 years', (years) => years >= 3 && years < 5],
  ['5–10 years', (years) => years >= 5 && years < 10],
  ['10+ years', (years) => years >= 10],
]

function last12Months() {
  const now = new Date()
  return Array.from({ length: 12 }, (_, index) => new Date(now.getFullYear(), now.getMonth() - (11 - index), 1))
}

function Ranking({ title, subtitle, data, sorted = true }: { title: string; subtitle?: string; data: Record<string, number>; sorted?: boolean }) {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0)
  const entries = sorted ? Object.entries(data).sort((a, b) => b[1] - a[1]) : Object.entries(data)

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="font-semibold">{title}</h3>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      <div className="mt-5 flex flex-col gap-4">
        {entries.map(([name, count]) => (
          <div key={name}>
            <div className="mb-2 flex justify-between text-sm">
              <span>{name}</span>
              <span className="text-muted-foreground">{count}</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(4, total ? (count / total) * 100 : 0)}%` }} />
            </div>
          </div>
        ))}
        {entries.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
      </div>
    </div>
  )
}

export function Reports() {
  const { staff, exportXlsx, isLoading, error } = useStaff()
  const total = staff.length

  const byDepartment = countBy(staff, (person) => person.department)
  const byGrade = countBy(staff, (person) => person.grade)
  const byLocation = countBy(staff, (person) => person.location)

  const byTenure = TENURE_BUCKETS.reduce<Record<string, number>>((result, [label, matches]) => {
    result[label] = staff.filter((person) => {
      const years = yearsOfService(person.appointmentDate)
      return years !== null && matches(years)
    }).length
    return result
  }, {})

  const female = staff.filter((person) => person.gender === 'Female').length
  const male = staff.filter((person) => person.gender === 'Male').length

  const hiresByMonth = last12Months().map((date) => {
    const count = staff.filter((person) => {
      const iso = toDateInputValue(person.appointmentDate)
      if (!iso) return false
      const hireDate = new Date(iso)
      return hireDate.getFullYear() === date.getFullYear() && hireDate.getMonth() === date.getMonth()
    }).length
    return {
      label: date.toLocaleDateString('en-GB', { month: 'short' }),
      full: date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      count,
    }
  })
  const maxHires = Math.max(1, ...hiresByMonth.map((month) => month.count))
  const hasHires = hiresByMonth.some((month) => month.count > 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="mb-2 text-sm text-muted-foreground">Workforce intelligence</p>
          <h2 className="text-3xl font-semibold tracking-tight">Reports</h2>
          <p className="mt-2 text-sm text-muted-foreground">Deeper summaries from your current staff register.</p>
        </div>
        <Button variant="outline" onClick={exportXlsx}>
          <ArrowDownToLine data-icon="inline-start" />
          Download XLSX
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(
          [
            ['Total staff', total],
            ['Active', staff.filter((person) => person.status === 'Active').length],
            ['On leave', staff.filter((person) => person.status === 'On leave').length],
            ['Probation', staff.filter((person) => person.status === 'Probation').length],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-4 text-3xl font-semibold">{isLoading ? '…' : value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-semibold">Gender balance</h3>
        <p className="mt-1 text-xs text-muted-foreground">{total} staff on register</p>
        <div className="mt-5">
          <div className="mb-2 flex justify-between text-sm">
            <span>Female · {female}</span>
            <span>Male · {male}</span>
          </div>
          <div className="flex h-2 gap-1">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(4, total ? (female / total) * 100 : 0)}%` }} />
            <div className="h-2 rounded-full bg-chart-3" style={{ width: `${Math.max(4, total ? (male / total) * 100 : 0)}%` }} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Ranking title="Staff by department" data={byDepartment} />
        <Ranking title="Staff by grade" data={byGrade} />
        <Ranking title="Staff by location" data={byLocation} />
        <Ranking title="Length of service" subtitle="Years since appointment date" data={byTenure} sorted={false} />
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-semibold">New hires, last 12 months</h3>
        <p className="mt-1 text-xs text-muted-foreground">Appointments by month</p>
        <div className="mt-6 flex h-32 items-end gap-2">
          {hiresByMonth.map((month) => (
            <div key={month.full} className="flex flex-1 flex-col items-center gap-2" title={`${month.full}: ${month.count} hire${month.count === 1 ? '' : 's'}`}>
              <div className="flex h-full w-full items-end">
                <div
                  className="w-full rounded-t bg-primary"
                  style={{ height: month.count > 0 ? `${Math.max(4, (month.count / maxHires) * 100)}%` : 0 }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{month.label}</span>
            </div>
          ))}
        </div>
        {!isLoading && !hasHires && <p className="mt-3 text-center text-sm text-muted-foreground">No appointment dates recorded yet.</p>}
      </div>
    </div>
  )
}
