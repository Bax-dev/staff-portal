'use client'

import { Pencil, Trash2, X } from 'lucide-react'
import { StaffAvatar } from '@/components/staff/staff-avatar'
import type { Staff } from '@/lib/staff-data'
import { useStaff } from '@/lib/staff-context'

export function StaffDrawer({ person, onClose }: { person: Staff; onClose: () => void }) {
  const { openEditForm, requestDelete } = useStaff()
  const sections = [
    ['Personal details', [['Name', person.name], ['Date of birth', person.dob], ['Gender', person.gender], ['Marital status', person.maritalStatus], ['Nationality', person.nationality]]],
    ['Contact details', [['Phone', person.phone], ['Email', person.email], ['Residential address', `${person.location}, Nigeria`]]],
    ['Identity', [['Staff ID', person.staffId], ['NIN', 'Not provided'], ['TIN', 'Not provided'], ['Pension PIN', 'Not provided']]],
    ['Employment', [['Cadre / rank', person.designation], ['Grade level / step', person.grade], ['Department', person.department], ['Status', person.status], ['Appointment date', person.appointmentDate]]],
    ['Payroll', [['Bank / account', 'Not provided'], ['BVN', 'Not provided'], ['IPPIS', 'Not provided'], ['PFA', 'Not provided']]],
    ['Medical', [['Blood group', 'Not provided'], ['Genotype', 'Not provided'], ['Medical fitness', 'Not provided']]],
  ]

  function handleEdit() {
    onClose()
    openEditForm(person)
  }

  function handleDelete() {
    onClose()
    requestDelete(person)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/20">
      <button aria-label="Close profile" className="flex-1 cursor-default" onClick={onClose} />
      <aside className="flex h-full w-full max-w-xl flex-col overflow-y-auto border-l bg-card shadow-xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b bg-card p-6">
          <div className="flex items-center gap-3">
            <StaffAvatar name={person.name} photo={person.photo} className="size-12 text-base" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">{person.staffId}</p>
              <h2 className="text-xl font-semibold">{person.name}</h2>
              <p className="text-sm text-muted-foreground">{person.designation}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button aria-label={`Edit ${person.name}`} onClick={handleEdit} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
              <Pencil className="size-4" />
            </button>
            <button aria-label={`Remove ${person.name}`} onClick={handleDelete} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="size-4" />
            </button>
            <button aria-label="Close profile" onClick={onClose} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-6 p-6">
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
          <div className="rounded-lg border border-dashed p-4">
            <p className="text-sm font-semibold">Additional records</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Education, certifications, next of kin, family, emergency contact, documents and service history can be added through the staff record workflow.</p>
          </div>
        </div>
      </aside>
    </div>
  )
}
