'use client'

import { useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DateInput } from '@/components/ui/date-input'
import { FieldLabel } from '@/components/ui/field-label'
import { StateSelect } from '@/components/ui/state-select'
import { StaffAvatar } from '@/components/staff/staff-avatar'
import { todayInputValue } from '@/lib/dates'
import { type Staff, type StaffFormValues } from '@/lib/staff-data'
import { useStaff } from '@/lib/staff-context'

const statuses: Staff['status'][] = ['Active', 'On leave', 'Probation']
const genders = ['Female', 'Male', 'Not specified']
const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed', 'Not specified']

function field(form: FormData, name: string) {
  return String(form.get(name) ?? '')
}

export function StaffFormModal({
  staff,
  onClose,
  onSubmit,
}: {
  staff: Staff | null
  onClose: () => void
  onSubmit: (values: StaffFormValues, photoFile?: File) => Promise<void>
}) {
  const { departments } = useStaff()
  const isEditing = staff !== null
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState(staff?.photo)
  const [photoFile, setPhotoFile] = useState<File | undefined>(undefined)
  const [photoPreview, setPhotoPreview] = useState(staff?.photo)
  const [name, setName] = useState(staff?.name ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handlePhotoChange(file: File | undefined) {
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = (event) => setPhotoPreview(typeof event.target?.result === 'string' ? event.target.result : undefined)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const values: StaffFormValues = {
      name: field(form, 'name'),
      staffId: field(form, 'staffId'),
      designation: field(form, 'designation'),
      department: field(form, 'department'),
      status: field(form, 'status') as Staff['status'],
      email: field(form, 'email'),
      phone: field(form, 'phone'),
      gender: field(form, 'gender'),
      grade: field(form, 'grade'),
      appointmentDate: field(form, 'appointmentDate'),
      location: field(form, 'location'),
      nationality: field(form, 'nationality'),
      dob: field(form, 'dob'),
      maritalStatus: field(form, 'maritalStatus'),
      photo,
      nin: field(form, 'nin'),
      tin: field(form, 'tin'),
      pensionPin: field(form, 'pensionPin'),
      bankName: field(form, 'bankName'),
      accountNumber: field(form, 'accountNumber'),
      bvn: field(form, 'bvn'),
      ippis: field(form, 'ippis'),
      pfa: field(form, 'pfa'),
      bloodGroup: field(form, 'bloodGroup'),
      genotype: field(form, 'genotype'),
      medicalFitness: field(form, 'medicalFitness'),
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await onSubmit(values, photoFile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this staff record.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto overflow-x-hidden rounded-xl border bg-card shadow-xl">
        <div className="flex items-start justify-between border-b p-5">
          <div>
            <h2 className="text-xl font-semibold">{isEditing ? 'Edit staff member' : 'Add staff member'}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{isEditing ? 'Update this staff record in the directory.' : 'Create a new staff record in the directory.'}</p>
          </div>
          <button aria-label="Close staff form" onClick={onClose}>
            <X className="size-5 text-muted-foreground" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <div className="flex items-center gap-4 sm:col-span-2">
            <div className="relative">
              <StaffAvatar name={name || 'New staff'} photo={photoPreview} className="size-16 text-lg" />
              <button type="button" aria-label="Upload profile photo" onClick={() => photoInputRef.current?.click()} className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full border-2 border-card bg-primary text-primary-foreground">
                <Camera className="size-3.5" />
              </button>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handlePhotoChange(event.target.files?.[0])} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Profile photo</p>
              {photoPreview ? (
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(undefined)
                    setPhotoFile(undefined)
                    setPhotoPreview(undefined)
                  }}
                  className="w-fit text-xs font-semibold text-destructive"
                >
                  Remove photo
                </button>
              ) : (
                <p className="text-xs text-muted-foreground">JPG or PNG, stored in S3.</p>
              )}
            </div>
          </div>

          <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
            <FieldLabel required>Full name</FieldLabel>
            <input required name="name" value={name} onChange={(event) => setName(event.target.value)} className="h-10 w-full min-w-0 rounded-lg border bg-background px-3 font-normal" />
          </label>
          <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
            <FieldLabel required>Staff ID</FieldLabel>
            <input required name="staffId" defaultValue={staff?.staffId} className="h-10 w-full min-w-0 rounded-lg border bg-background px-3 font-normal" />
          </label>
          <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
            <FieldLabel required>Designation</FieldLabel>
            <input required name="designation" defaultValue={staff?.designation} className="h-10 w-full min-w-0 rounded-lg border bg-background px-3 font-normal" />
          </label>
          <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
            <FieldLabel required>Department</FieldLabel>
            <select required name="department" defaultValue={staff?.department ?? departments[0]} className="h-10 w-full min-w-0 rounded-lg border bg-background px-3 font-normal">
              {departments.map((unit) => (
                <option key={unit}>{unit}</option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
            Status
            <select name="status" defaultValue={staff?.status ?? 'Active'} className="h-10 w-full min-w-0 rounded-lg border bg-background px-3 font-normal">
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
            Grade level / step
            <input name="grade" defaultValue={staff?.grade} placeholder="GL 12 / Step 4" className="h-10 w-full min-w-0 rounded-lg border bg-background px-3 font-normal" />
          </label>
          <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
            Email
            <input type="email" name="email" defaultValue={staff?.email} className="h-10 w-full min-w-0 rounded-lg border bg-background px-3 font-normal" />
          </label>
          <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
            Phone
            <input name="phone" defaultValue={staff?.phone} className="h-10 w-full min-w-0 rounded-lg border bg-background px-3 font-normal" />
          </label>
          <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
            Gender
            <select name="gender" defaultValue={staff?.gender ?? 'Not specified'} className="h-10 w-full min-w-0 rounded-lg border bg-background px-3 font-normal">
              {genders.map((gender) => (
                <option key={gender}>{gender}</option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
            Marital status
            <select name="maritalStatus" defaultValue={staff?.maritalStatus ?? 'Not specified'} className="h-10 w-full min-w-0 rounded-lg border bg-background px-3 font-normal">
              {maritalStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
            Nationality
            <input name="nationality" defaultValue={staff?.nationality ?? 'Nigerian'} className="h-10 w-full min-w-0 rounded-lg border bg-background px-3 font-normal" />
          </label>
          <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
            Date of birth
            <DateInput name="dob" defaultValue={staff?.dob} max={todayInputValue()} />
          </label>
          <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
            Appointment date
            <DateInput name="appointmentDate" defaultValue={staff?.appointmentDate} max={todayInputValue()} />
          </label>
          <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
            State
            <StateSelect name="location" defaultValue={staff?.location} />
          </label>

          <p className="sm:col-span-2 pt-2 text-sm font-semibold">Identity, payroll and medical</p>
          {[
            ['nin', 'NIN', staff?.nin],
            ['tin', 'TIN', staff?.tin],
            ['pensionPin', 'Pension PIN', staff?.pensionPin],
            ['bankName', 'Bank name', staff?.bankName],
            ['accountNumber', 'Account number', staff?.accountNumber],
            ['bvn', 'BVN', staff?.bvn],
            ['ippis', 'IPPIS', staff?.ippis],
            ['pfa', 'PFA', staff?.pfa],
            ['bloodGroup', 'Blood group', staff?.bloodGroup],
            ['genotype', 'Genotype', staff?.genotype],
            ['medicalFitness', 'Medical fitness', staff?.medicalFitness],
          ].map(([name, label, value]) => (
            <label key={name} className="flex min-w-0 flex-col gap-2 text-sm font-medium">
              {label}
              <input name={name} defaultValue={value === 'Not provided' ? '' : value} className="h-10 w-full min-w-0 rounded-lg border bg-background px-3 font-normal" />
            </label>
          ))}

          {error && <p className="sm:col-span-2 text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create staff record'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
