'use client'

import { Archive, ArchiveRestore, Pencil, Trash2, X } from 'lucide-react'
import { StaffAvatar } from '@/components/staff/staff-avatar'
import { StaffRecordsPanel } from '@/components/staff/staff-records-panel'
import type { Staff } from '@/lib/staff-data'
import { useStaff } from '@/lib/staff-context'

function display(value?: string) {
  return value && value !== 'Not provided' ? value : 'Not provided'
}

export function StaffDrawer({ person, onClose }: { person: Staff; onClose: () => void }) {
  const { openEditForm, requestDelete, requestArchive, requestUnarchive } = useStaff()
  const sections = [
    ['Personal details', [['Name', person.name], ['Date of birth', person.dob], ['Gender', person.gender], ['Marital status', person.maritalStatus], ['Nationality', person.nationality]]],
    ['Contact details', [['Phone', person.phone], ['Email', person.email], ['State', person.location]]],
    ['Identity', [['Staff ID', person.staffId], ['NIN', display(person.nin)], ['TIN', display(person.tin)], ['Pension PIN', display(person.pensionPin)]]],
    ['Employment', [['Cadre / rank', person.designation], ['Grade level / step', person.grade], ['Department', person.department], ['Status', person.status], ['Appointment date', person.appointmentDate]]],
    ['Payroll', [['Bank / account', display(person.bankName) === 'Not provided' ? 'Not provided' : `${person.bankName} ${person.accountNumber}`.trim()], ['BVN', display(person.bvn)], ['IPPIS', display(person.ippis)], ['PFA', display(person.pfa)]]],
    ['Medical', [['Blood group', display(person.bloodGroup)], ['Genotype', display(person.genotype)], ['Medical fitness', display(person.medicalFitness)]]],
  ]

  function handleEdit() {
    onClose()
    openEditForm(person)
  }

  function handleDelete() {
    onClose()
    requestDelete(person)
  }

  function handleArchive() {
    onClose()
    requestArchive(person)
  }

  function handleUnarchive() {
    onClose()
    requestUnarchive(person)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/20">
      <button aria-label="Close profile" className="flex-1 cursor-default" onClick={onClose} />
      <aside className="flex h-full w-full max-w-2xl min-w-0 flex-col overflow-y-auto overflow-x-hidden border-l bg-card shadow-xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b bg-card p-6">
          <div className="flex items-center gap-3">
            <StaffAvatar name={person.name} photo={person.photo} className="size-12 text-base" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">{person.staffId}</p>
              <h2 className="text-xl font-semibold">{person.name}</h2>
              <p className="text-sm text-muted-foreground">{person.designation}</p>
              {person.archived && <p className="mt-1 text-xs font-medium text-muted-foreground">Archived</p>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button aria-label={`Edit ${person.name}`} onClick={handleEdit} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
              <Pencil className="size-4" />
            </button>
            {person.archived ? (
              <button aria-label={`Restore ${person.name}`} onClick={handleUnarchive} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                <ArchiveRestore className="size-4" />
              </button>
            ) : (
              <button aria-label={`Archive ${person.name}`} onClick={handleArchive} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                <Archive className="size-4" />
              </button>
            )}
            <button aria-label={`Remove ${person.name}`} onClick={handleDelete} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="size-4" />
            </button>
            <button aria-label="Close profile" onClick={onClose} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-6 p-6">
          {sections.map(([title, values]) => (
            <section key={String(title)}>
              <h3 className="mb-3 text-sm font-semibold">{title}</h3>
              <div className="grid gap-3 rounded-lg border bg-background p-4 sm:grid-cols-2">
                {(values as string[][]).map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
                    <p className="mt-1 text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
          <StaffRecordsPanel staffId={person.id} />
        </div>
      </aside>
    </div>
  )
}
