'use client'

import Link from 'next/link'
import { Activity, Building2, ChevronRight, ClipboardList, MoreHorizontal, Users, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StaffAvatar } from '@/components/staff/staff-avatar'
import { orgUnits } from '@/lib/staff-data'
import { useStaff } from '@/lib/staff-context'

export function Overview() {
  const { staff, selectStaff } = useStaff()
  const stats: [string, string | number, LucideIcon][] = [
    ['Total staff', staff.length, Users],
    ['Active staff', staff.filter((p) => p.status === 'Active').length, Activity],
    ['Departments', 10, Building2],
    ['Records updated', '94%', ClipboardList],
  ]

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-sm text-muted-foreground">Good morning, Admin Officer</p>
          <h2 className="text-3xl font-semibold tracking-tight">Staff overview</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">A clear view of people, departments and records across the directorate.</p>
        </div>
        <Button nativeButton={false} render={<Link href="/staff" />}>
          <Users data-icon="inline-start" />
          View directory
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, Icon]) => (
          <div key={label} className="rounded-xl border bg-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className="size-4 text-primary" />
            </div>
            <p className="text-3xl font-semibold tracking-tight">{value}</p>
            <p className="mt-2 text-xs text-muted-foreground">Across the directorate</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h3 className="font-semibold">Recent staff records</h3>
              <p className="mt-1 text-xs text-muted-foreground">Latest updates in your workspace</p>
            </div>
            <Link href="/staff" className="text-xs font-semibold text-primary">
              View all
            </Link>
          </div>
          <div className="divide-y">
            {staff.slice(0, 4).map((person) => (
              <button key={person.id} onClick={() => selectStaff(person)} className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-muted/50">
                <StaffAvatar name={person.name} photo={person.photo} className="size-9 text-xs" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{person.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{person.designation}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">{person.status}</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h3 className="font-semibold">Organization structure</h3>
              <p className="mt-1 text-xs text-muted-foreground">Native navigation from the organogram</p>
            </div>
            <Link href="/organization" aria-label="Open organization">
              <MoreHorizontal className="size-4 text-muted-foreground" />
            </Link>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Link href="/organization" className="w-full rounded-lg border-2 border-primary bg-primary/5 px-4 py-3 text-center text-sm font-semibold">
              Planning and Design
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="grid w-full gap-2 sm:grid-cols-3">
              {orgUnits.map((unit) => (
                <Link key={unit.name} href="/organization" className="rounded-lg border bg-muted/30 px-2 py-3 text-center text-xs font-semibold hover:border-primary">
                  {unit.name}
                </Link>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground">10 functional units · 3 directorate branches</p>
          </div>
        </div>
      </div>
    </div>
  )
}
