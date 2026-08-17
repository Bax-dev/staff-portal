'use client'

import { useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StaffAvatar } from '@/components/staff/staff-avatar'
import { orgUnits, type Staff } from '@/lib/staff-data'
import type { StaffFormValues } from '@/lib/staff-context'

const statuses: Staff['status'][] = ['Active', 'On leave', 'Probation']
const genders = ['Female', 'Male', 'Not specified']
const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed', 'Not specified']

export function StaffFormModal({ staff, onClose, onSubmit }: { staff: Staff | null; onClose: () => void; onSubmit: (values: StaffFormValues) => void }) {
  const isEditing = staff !== null
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState(staff?.photo)
  const [name, setName] = useState(staff?.name ?? '')

  function handlePhotoChange(file: File | undefined) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => setPhoto(typeof event.target?.result === 'string' ? event.target.result : undefined)
    reader.readAsDataURL(file)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const values: StaffFormValues = {
      name: String(form.get('name')),
      staffId: String(form.get('staffId')),
      designation: String(form.get('designation')),
      department: String(form.get('department')),
      status: String(form.get('status')) as Staff['status'],
      email: String(form.get('email')),
      phone: String(form.get('phone')),
      gender: String(form.get('gender')),
      grade: String(form.get('grade')),
      appointmentDate: String(form.get('appointmentDate')),
      location: String(form.get('location')),
      nationality: String(form.get('nationality')),
      dob: String(form.get('dob')),
      maritalStatus: String(form.get('maritalStatus')),
      photo,
    }
    onSubmit(values)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border bg-card shadow-xl">
        <div className="flex items-start justify-between border-b p-5">
          <div>
            <h2 className="text-xl font-semibold">{isEditing ? 'Edit staff member' : 'Add staff member'}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{isEditing ? 'Update this staff record in the directory.' : 'Create a new staff record in the directory.'}</p>
          </div>
          <button aria-label="Close staff form" onClick={onClose}>
            <X className="size-5 text-muted-foreground" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="flex items-center gap-4 sm:col-span-2">
            <div className="relative">
              <StaffAvatar name={name || 'New staff'} photo={photo} className="size-16 text-lg" />
              <button
                type="button"
                aria-label="Upload profile photo"
                onClick={() => photoInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full border-2 border-card bg-primary text-primary-foreground"
              >
                <Camera className="size-3.5" />
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handlePhotoChange(event.target.files?.[0])}
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Profile photo</p>
              {photo ? (
                <button type="button" onClick={() => setPhoto(undefined)} className="w-fit text-xs font-semibold text-destructive">
                  Remove photo
                </button>
              ) : (
                <p className="text-xs text-muted-foreground">JPG or PNG, shown across the directory.</p>
              )}
            </div>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium">
            Full name
            <input required name="name" value={name} onChange={(event) => setName(event.target.value)} className="h-10 rounded-lg border bg-background px-3 font-normal" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Staff ID
            <input required name="staffId" defaultValue={staff?.staffId} className="h-10 rounded-lg border bg-background px-3 font-normal" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Designation
            <input required name="designation" defaultValue={staff?.designation} className="h-10 rounded-lg border bg-background px-3 font-normal" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Department
            <select name="department" defaultValue={staff?.department ?? 'Planning and Design'} className="h-10 rounded-lg border bg-background px-3 font-normal">
              <option>Planning and Design</option>
              {orgUnits.flatMap((unit) => [unit.name, ...unit.children]).map((unit) => (
                <option key={unit}>{unit}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Status
            <select name="status" defaultValue={staff?.status ?? 'Active'} className="h-10 rounded-lg border bg-background px-3 font-normal">
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Grade level / step
            <input name="grade" defaultValue={staff?.grade} placeholder="GL 12 / Step 4" className="h-10 rounded-lg border bg-background px-3 font-normal" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Email
            <input type="email" name="email" defaultValue={staff?.email} className="h-10 rounded-lg border bg-background px-3 font-normal" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Phone
            <input name="phone" defaultValue={staff?.phone} className="h-10 rounded-lg border bg-background px-3 font-normal" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Gender
            <select name="gender" defaultValue={staff?.gender ?? 'Not specified'} className="h-10 rounded-lg border bg-background px-3 font-normal">
              {genders.map((gender) => (
                <option key={gender}>{gender}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Marital status
            <select name="maritalStatus" defaultValue={staff?.maritalStatus ?? 'Not specified'} className="h-10 rounded-lg border bg-background px-3 font-normal">
              {maritalStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Nationality
            <input name="nationality" defaultValue={staff?.nationality ?? 'Nigerian'} className="h-10 rounded-lg border bg-background px-3 font-normal" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Date of birth
            <input name="dob" defaultValue={staff?.dob} placeholder="22 Jun 1990" className="h-10 rounded-lg border bg-background px-3 font-normal" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Appointment date
            <input name="appointmentDate" defaultValue={staff?.appointmentDate} placeholder="01 Jan 2026" className="h-10 rounded-lg border bg-background px-3 font-normal" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Location
            <input name="location" defaultValue={staff?.location} placeholder="Abuja" className="h-10 rounded-lg border bg-background px-3 font-normal" />
          </label>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? 'Save changes' : 'Create staff record'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
