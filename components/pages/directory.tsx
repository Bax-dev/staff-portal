'use client'

import { ArrowDownToLine, ArrowUpFromLine, Pencil, Plus, Search, SlidersHorizontal, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StaffAvatar } from '@/components/staff/staff-avatar'
import { allDepartments } from '@/lib/staff-data'
import { useStaff } from '@/lib/staff-context'

export function Directory() {
  const { staff, filteredStaff, query, setQuery, department, setDepartment, selectStaff, openCreateForm, openEditForm, requestDelete, triggerImport, exportCsv, exportXlsx } = useStaff()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            {filteredStaff.length} of {staff.length} records
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">Staff directory</h2>
          <p className="mt-2 text-sm text-muted-foreground">Search, filter, import and download staff records.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={triggerImport}>
            <ArrowUpFromLine data-icon="inline-start" />
            Import
          </Button>
          <Button variant="outline" onClick={exportCsv}>
            <ArrowDownToLine data-icon="inline-start" />
            CSV
          </Button>
          <Button variant="outline" onClick={exportXlsx}>
            <ArrowDownToLine data-icon="inline-start" />
            XLSX
          </Button>
          <Button onClick={openCreateForm}>
            <Plus data-icon="inline-start" />
            Add staff
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            aria-label="Search staff"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, ID, designation or department"
            className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="relative min-w-56">
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <select
            aria-label="Filter department"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="h-10 w-full appearance-none rounded-lg border bg-background pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option>All departments</option>
            {allDepartments().map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
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
                <th className="px-5 py-3 font-medium">Grade</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStaff.map((person) => (
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
                  <td className="px-5 py-4 text-muted-foreground">{person.grade}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">{person.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button aria-label={`Edit ${person.name}`} onClick={() => openEditForm(person)} className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                        <Pencil className="size-4" />
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
        {filteredStaff.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">No staff records match your search.</div>}
      </div>
    </div>
  )
}
