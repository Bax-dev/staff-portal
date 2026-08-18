'use client'

import { useStaff } from '@/lib/staff-context'

export function Organization() {
  const { goToDepartment, orgTree, organizationName } = useStaff()
  const units = orgTree[0]?.children ?? []

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
        {units.length > 0 && (
          <>
            <div className="mx-auto h-8 w-px bg-primary/40" />
            <div className="mx-auto h-px w-4/5 bg-primary/40" />
            <div className="grid gap-4 pt-0 md:grid-cols-3">
              {units.map((unit) => (
                <div key={unit.id} className="flex flex-col items-center">
                  <div className="h-5 w-px bg-primary/40" />
                  <button onClick={() => goToDepartment(unit.name)} className="w-full rounded-lg border-2 border-primary bg-primary/5 px-3 py-4 text-center text-sm font-semibold">
                    {unit.name}
                  </button>
                  <div className="mt-4 flex w-full flex-col gap-2">
                    {unit.children.map((child) => (
                      <button key={child.id} onClick={() => goToDepartment(child.name)} className="rounded-lg border bg-background px-3 py-3 text-center text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary">
                        {child.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <div className="mt-8 rounded-lg bg-muted/50 p-4 text-center text-xs text-muted-foreground">Select a branch or unit to open its filtered staff directory.</div>
      </div>
    </div>
  )
}
