'use client'

import { useStaff } from '@/lib/staff-context'

export function Organization() {
  const { goToDepartment, orgTree, organizationName } = useStaff()
  const departments = orgTree[0]?.children ?? []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Directorate hierarchy</p>
        <h2 className="text-3xl font-semibold tracking-tight">Organization</h2>
        <p className="mt-2 text-sm text-muted-foreground">Every branch and functional unit from the approved organogram.</p>
      </div>
      <div className="rounded-xl border bg-card p-5 md:p-8">
        <button onClick={() => goToDepartment(orgTree[0]?.name ?? organizationName)} className="mx-auto block rounded-lg border-2 border-primary bg-primary/5 px-8 py-4 text-sm font-semibold">
          {orgTree[0]?.name ?? organizationName}
        </button>
        {departments.length > 0 && (
          <>
            <div className="mx-auto h-8 w-px bg-primary/40" />
            <div className="mx-auto h-px w-4/5 bg-primary/40" />
            <div className="grid gap-4 pt-0 md:grid-cols-3">
              {departments.map((department) => (
                <div key={department.id} className="flex flex-col items-center">
                  <div className="h-5 w-px bg-primary/40" />
                  <button onClick={() => goToDepartment(department.name)} className="flex w-full flex-col items-center gap-1 rounded-lg border-2 border-primary bg-primary/5 px-3 py-4 text-center">
                    <span className="text-sm font-semibold">{department.name}</span>
                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{department.children.length} units</span>
                  </button>
                  <div className="mt-4 flex w-full flex-col gap-2">
                    {department.children.map((unit) => (
                      <button key={unit.id} onClick={() => goToDepartment(unit.name)} className="rounded-lg border bg-background px-3 py-3 text-center text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary">
                        {unit.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <div className="mt-8 rounded-lg bg-muted/50 p-4 text-center text-xs text-muted-foreground">Select a department or unit to open its filtered staff directory.</div>
      </div>
    </div>
  )
}
