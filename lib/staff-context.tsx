'use client'

import { createContext, useContext, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { escapeCsv, initialStaff, type Staff } from '@/lib/staff-data'

export type StaffFormValues = Omit<Staff, 'id'>

type StaffContextValue = {
  staff: Staff[]
  filteredStaff: Staff[]
  query: string
  setQuery: (value: string) => void
  department: string
  setDepartment: (value: string) => void
  selectedStaff: Staff | null
  selectStaff: (person: Staff | null) => void
  formOpen: boolean
  formStaff: Staff | null
  openCreateForm: () => void
  openEditForm: (person: Staff) => void
  closeForm: () => void
  saveStaff: (values: StaffFormValues) => void
  deletingStaff: Staff | null
  requestDelete: (person: Staff) => void
  cancelDelete: () => void
  confirmDelete: () => void
  exportCsv: () => void
  exportXlsx: () => void
  triggerImport: () => void
  importFile: (file: File) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  goToDepartment: (department: string) => void
}

const StaffContext = createContext<StaffContextValue | null>(null)

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [staff, setStaff] = useState(initialStaff)
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('All departments')
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formStaff, setFormStaff] = useState<Staff | null>(null)
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredStaff = useMemo(
    () =>
      staff.filter(
        (person) =>
          `${person.name} ${person.designation} ${person.staffId} ${person.department}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (department === 'All departments' || person.department === department),
      ),
    [staff, query, department],
  )

  function exportCsv() {
    const headers = ['Name', 'Staff ID', 'Designation', 'Department', 'Email', 'Phone', 'Gender', 'Status', 'Grade', 'Appointment date', 'Location']
    const rows = filteredStaff.map((p) => [p.name, p.staffId, p.designation, p.department, p.email, p.phone, p.gender, p.status, p.grade, p.appointmentDate, p.location])
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    link.download = 'organo-staff-directory.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  function exportXlsx() {
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(filteredStaff.map(({ id, photo, ...person }) => person)), 'Staff Directory')
    XLSX.writeFile(workbook, 'organo-staff-directory.xlsx')
  }

  function importFile(file: File) {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target?.result, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet)
        const imported = rows.map((row, index) => ({
          id: `import-${Date.now()}-${index}`,
          name: row.Name || row.name || 'Unnamed staff',
          staffId: row['Staff ID'] || row.staffId || `IMP-${index + 1}`,
          designation: row.Designation || row.designation || 'Staff',
          department: row.Department || row.department || 'Planning and Design',
          email: row.Email || row.email || '',
          phone: row.Phone || row.phone || '',
          gender: row.Gender || row.gender || 'Not specified',
          status: (row.Status || row.status || 'Active') as Staff['status'],
          grade: row.Grade || row.grade || 'Not specified',
          appointmentDate: row['Appointment date'] || row.appointmentDate || 'Not specified',
          location: row.Location || row.location || 'Not specified',
          nationality: row.Nationality || row.nationality || 'Nigerian',
          dob: row.DOB || row.dob || 'Not specified',
          maritalStatus: row['Marital status'] || row.maritalStatus || 'Not specified',
        }))
        setStaff((current) => [...imported, ...current])
        router.push('/staff')
      } catch {
        window.alert('Could not read this file. Please upload a valid CSV or XLSX file.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  function openCreateForm() {
    setFormStaff(null)
    setFormOpen(true)
  }

  function openEditForm(person: Staff) {
    setFormStaff(person)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setFormStaff(null)
  }

  function saveStaff(values: StaffFormValues) {
    if (formStaff) {
      const updated: Staff = { ...formStaff, ...values }
      setStaff((current) => current.map((person) => (person.id === formStaff.id ? updated : person)))
      setSelectedStaff((current) => (current && current.id === formStaff.id ? updated : current))
    } else {
      const created: Staff = { id: `new-${Date.now()}`, ...values }
      setStaff((current) => [created, ...current])
    }
    closeForm()
    router.push('/staff')
  }

  function requestDelete(person: Staff) {
    setDeletingStaff(person)
  }

  function cancelDelete() {
    setDeletingStaff(null)
  }

  function confirmDelete() {
    if (!deletingStaff) return
    const id = deletingStaff.id
    setStaff((current) => current.filter((person) => person.id !== id))
    setSelectedStaff((current) => (current && current.id === id ? null : current))
    setDeletingStaff(null)
  }

  function goToDepartment(nextDepartment: string) {
    setDepartment(nextDepartment)
    router.push('/staff')
  }

  const value: StaffContextValue = {
    staff,
    filteredStaff,
    query,
    setQuery,
    department,
    setDepartment,
    selectedStaff,
    selectStaff: setSelectedStaff,
    formOpen,
    formStaff,
    openCreateForm,
    openEditForm,
    closeForm,
    saveStaff,
    deletingStaff,
    requestDelete,
    cancelDelete,
    confirmDelete,
    exportCsv,
    exportXlsx,
    triggerImport: () => fileInputRef.current?.click(),
    importFile,
    fileInputRef,
    goToDepartment,
  }

  return (
    <StaffContext.Provider value={value}>
      {children}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) importFile(file)
          event.currentTarget.value = ''
        }}
      />
    </StaffContext.Provider>
  )
}

export function useStaff() {
  const context = useContext(StaffContext)
  if (!context) throw new Error('useStaff must be used within a StaffProvider')
  return context
}
