'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { DateInput } from '@/components/ui/date-input'
import { FieldLabel } from '@/components/ui/field-label'
import { formatDateLabel } from '@/lib/dates'
import { useStaff } from '@/lib/staff-context'
import {
  certificationApi,
  educationApi,
  emergencyContactApi,
  familyApi,
  nextOfKinApi,
  serviceHistoryApi,
} from '@/lib/api'
import type {
  CertificationRecord,
  EducationRecord,
  EmergencyContactRecord,
  FamilyMemberRecord,
  NextOfKinRecord,
  ServiceHistoryRecord,
} from '@/lib/api/types'

function DateField({ name, label, required }: { name: string; label: string; required?: boolean }) {
  return (
    <label className="flex min-w-0 w-full flex-col gap-1 text-xs font-medium">
      <FieldLabel required={required}>{label}</FieldLabel>
      <DateInput name={name} required={required} aria-label={label} className="h-9 text-sm font-normal" />
    </label>
  )
}

function TextField({ name, label, required, placeholder }: { name: string; label: string; required?: boolean; placeholder: string }) {
  return (
    <label className="flex min-w-0 w-full flex-col gap-1 text-xs font-medium">
      <FieldLabel required={required}>{label}</FieldLabel>
      <input required={required} name={name} placeholder={placeholder} className="h-9 w-full min-w-0 rounded-lg border bg-background px-3 text-sm font-normal" />
    </label>
  )
}

function AddButton() {
  return (
    <Button type="submit" variant="outline" size="sm" className="col-span-full justify-self-end">
      Add
    </Button>
  )
}

function RecordList({ title, items, onRemove }: { title: string; items: Array<{ id: string; label: string }>; onRemove: (id: string) => void }) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      {items.length === 0 && <p className="mb-3 text-xs text-muted-foreground">None added yet.</p>}
      <div className="mb-3 flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm">
            <span>{item.label}</span>
            <button type="button" onClick={() => onRemove(item.id)} className="text-xs font-semibold text-destructive">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function StaffRecordsPanel({ staffId }: { staffId: string }) {
  const { refresh } = useStaff()
  const [education, setEducation] = useState<EducationRecord[]>([])
  const [certifications, setCertifications] = useState<CertificationRecord[]>([])
  const [family, setFamily] = useState<FamilyMemberRecord[]>([])
  const [emergency, setEmergency] = useState<EmergencyContactRecord[]>([])
  const [nextOfKin, setNextOfKin] = useState<NextOfKinRecord[]>([])
  const [history, setHistory] = useState<ServiceHistoryRecord[]>([])
  const [error, setError] = useState<string | null>(null)

  async function reload() {
    const [edu, certs, fam, emg, nok, svc] = await Promise.all([
      educationApi.list(staffId),
      certificationApi.list(staffId),
      familyApi.list(staffId),
      emergencyContactApi.list(staffId),
      nextOfKinApi.list(staffId),
      serviceHistoryApi.list(staffId),
    ])
    setEducation(edu)
    setCertifications(certs)
    setFamily(fam)
    setEmergency(emg)
    setNextOfKin(nok)
    setHistory(svc)
  }

  useEffect(() => {
    reload().catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not load additional records.'))
  }, [staffId])

  async function handleCreate(action: () => Promise<unknown>) {
    setError(null)
    try {
      await action()
      await reload()
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this record.')
    }
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-dashed p-4">
      <p className="text-sm font-semibold">Additional records</p>
      <p className="mt-1 mb-4 text-xs leading-5 text-muted-foreground">Education, certifications, family, next of kin, emergency contacts and service history.</p>
      {error && <p className="mb-3 text-xs text-destructive">{error}</p>}

      <RecordList
        title="Education"
        items={education.map((item) => ({
          id: item.id,
          label: [item.qualification, item.institution, formatDateLabel(item.startDate), formatDateLabel(item.endDate)].filter(Boolean).join(' · '),
        }))}
        onRemove={(id) => handleCreate(() => educationApi.remove(staffId, id))}
      />
      <form
        className="mb-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          const form = new FormData(event.currentTarget)
          handleCreate(() =>
            educationApi.create(staffId, {
              institution: String(form.get('institution')),
              qualification: String(form.get('qualification')),
              startDate: String(form.get('startDate') || '') || undefined,
              endDate: String(form.get('endDate') || '') || undefined,
            }),
          )
          event.currentTarget.reset()
        }}
      >
        <TextField required name="institution" label="Institution" placeholder="Institution" />
        <TextField required name="qualification" label="Qualification" placeholder="Qualification" />
        <DateField name="startDate" label="Start date" />
        <DateField name="endDate" label="End date" />
        <AddButton />
      </form>

      <RecordList
        title="Certifications"
        items={certifications.map((item) => ({
          id: item.id,
          label: [item.name, item.issuer, formatDateLabel(item.issuedDate), formatDateLabel(item.expiryDate)].filter(Boolean).join(' · '),
        }))}
        onRemove={(id) => handleCreate(() => certificationApi.remove(staffId, id))}
      />
      <form
        className="mb-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          const form = new FormData(event.currentTarget)
          handleCreate(() =>
            certificationApi.create(staffId, {
              name: String(form.get('name')),
              issuer: String(form.get('issuer')),
              issuedDate: String(form.get('issuedDate') || '') || undefined,
              expiryDate: String(form.get('expiryDate') || '') || undefined,
            }),
          )
          event.currentTarget.reset()
        }}
      >
        <TextField required name="name" label="Certification" placeholder="Certification" />
        <TextField required name="issuer" label="Issuer" placeholder="Issuer" />
        <DateField name="issuedDate" label="Issued date" />
        <DateField name="expiryDate" label="Expiry date" />
        <AddButton />
      </form>

      <RecordList
        title="Family"
        items={family.map((item) => ({
          id: item.id,
          label: [item.name, item.relationship, formatDateLabel(item.dateOfBirth)].filter(Boolean).join(' · '),
        }))}
        onRemove={(id) => handleCreate(() => familyApi.remove(staffId, id))}
      />
      <form
        className="mb-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          const form = new FormData(event.currentTarget)
          handleCreate(() =>
            familyApi.create(staffId, {
              name: String(form.get('name')),
              relationship: String(form.get('relationship')),
              dateOfBirth: String(form.get('dateOfBirth') || '') || undefined,
            }),
          )
          event.currentTarget.reset()
        }}
      >
        <TextField required name="name" label="Name" placeholder="Name" />
        <TextField required name="relationship" label="Relationship" placeholder="Relationship" />
        <DateField name="dateOfBirth" label="Date of birth" />
        <AddButton />
      </form>

      <RecordList title="Emergency contacts" items={emergency.map((item) => ({ id: item.id, label: `${item.name} · ${item.phone}` }))} onRemove={(id) => handleCreate(() => emergencyContactApi.remove(staffId, id))} />
      <form
        className="mb-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          const form = new FormData(event.currentTarget)
          handleCreate(() =>
            emergencyContactApi.create(staffId, {
              name: String(form.get('name')),
              relationship: String(form.get('relationship')),
              phone: String(form.get('phone')),
            }),
          )
          event.currentTarget.reset()
        }}
      >
        <TextField required name="name" label="Name" placeholder="Name" />
        <TextField required name="relationship" label="Relationship" placeholder="Relationship" />
        <TextField required name="phone" label="Phone" placeholder="Phone" />
        <AddButton />
      </form>

      <RecordList title="Next of kin" items={nextOfKin.map((item) => ({ id: item.id, label: `${item.name} · ${item.phone}` }))} onRemove={(id) => handleCreate(() => nextOfKinApi.remove(staffId, id))} />
      <form
        className="mb-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          const form = new FormData(event.currentTarget)
          handleCreate(() =>
            nextOfKinApi.create(staffId, {
              name: String(form.get('name')),
              relationship: String(form.get('relationship')),
              phone: String(form.get('phone')),
            }),
          )
          event.currentTarget.reset()
        }}
      >
        <TextField required name="name" label="Name" placeholder="Name" />
        <TextField required name="relationship" label="Relationship" placeholder="Relationship" />
        <TextField required name="phone" label="Phone" placeholder="Phone" />
        <AddButton />
      </form>

      <RecordList
        title="Service history"
        items={history.map((item) => ({
          id: item.id,
          label: [item.type, item.title, formatDateLabel(item.effectiveDate)].filter(Boolean).join(' · '),
        }))}
        onRemove={(id) => handleCreate(() => serviceHistoryApi.remove(staffId, id))}
      />
      <form
        className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          const form = new FormData(event.currentTarget)
          handleCreate(() =>
            serviceHistoryApi.create(staffId, {
              type: String(form.get('type')),
              title: String(form.get('title')),
              effectiveDate: String(form.get('effectiveDate')),
            }),
          )
          event.currentTarget.reset()
        }}
      >
        <label className="flex min-w-0 w-full flex-col gap-1 text-xs font-medium">
          <FieldLabel required>Type</FieldLabel>
          <select required name="type" className="h-9 w-full min-w-0 rounded-lg border bg-background px-3 text-sm font-normal">
            <option value="PROMOTION">Promotion</option>
            <option value="POSTING">Posting</option>
            <option value="TRANSFER">Transfer</option>
            <option value="LEAVE">Leave</option>
          </select>
        </label>
        <TextField required name="title" label="Title" placeholder="Title" />
        <DateField required name="effectiveDate" label="Effective date" />
        <AddButton />
      </form>
    </section>
  )
}
