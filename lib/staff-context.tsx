'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { toastError } from '@/components/ui/toast'
import { departmentApi, documentApi, inferFileMimeType, settingsApi, staffApi, uploadFileToS3 } from '@/lib/api'
import type { DepartmentNode } from '@/lib/api/types'
import { escapeCsv, flattenDepartmentNames, spreadsheetField, type Staff, type StaffFormValues } from '@/lib/staff-data'

type StaffContextValue = {
  staff: Staff[]
  filteredStaff: Staff[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  dataVersion: number
  query: string
  setQuery: (value: string) => void
  department: string
  setDepartment: (value: string) => void
  departments: string[]
  orgTree: DepartmentNode[]
  organizationName: string
  defaultExportFormat: 'CSV' | 'XLSX'
  selectedStaff: Staff | null
  selectStaff: (person: Staff | null) => void
  formOpen: boolean
  formStaff: Staff | null
  openCreateForm: () => void
  openEditForm: (person: Staff) => void
  closeForm: () => void
  saveStaff: (values: StaffFormValues, photoFile?: File) => Promise<void>
  deletingStaff: Staff | null
  requestDelete: (person: Staff) => void
  cancelDelete: () => void
  confirmDelete: () => Promise<void>
  archivingStaff: Staff | null
  requestArchive: (person: Staff) => void
  cancelArchive: () => void
  confirmArchive: () => Promise<void>
  unarchivingStaff: Staff | null
  requestUnarchive: (person: Staff) => void
  cancelUnarchive: () => void
  confirmUnarchive: () => Promise<void>
  exportCsv: () => void
  exportXlsx: () => void
  triggerImport: () => void
  importFile: (file: File) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  goToDepartment: (department: string) => void
}

const StaffContext = createContext<StaffContextValue | null>(null)

function emptyExtras(): Pick<Staff, 'nin' | 'tin' | 'pensionPin' | 'bankName' | 'accountNumber' | 'bvn' | 'ippis' | 'pfa' | 'bloodGroup' | 'genotype' | 'medicalFitness'> {
  return {
    nin: '',
    tin: '',
    pensionPin: '',
    bankName: '',
    accountNumber: '',
    bvn: '',
    ippis: '',
    pfa: '',
    bloodGroup: '',
    genotype: '',
    medicalFitness: '',
  }
}

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [staff, setStaff] = useState<Staff[]>([])
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([])
  const [orgTree, setOrgTree] = useState<DepartmentNode[]>([])
  const [organizationName, setOrganizationName] = useState('Planning and Design Directorate')
  const [defaultExportFormat, setDefaultExportFormat] = useState<'CSV' | 'XLSX'>('XLSX')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [department, setDepartment] = useState('All departments')
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formStaff, setFormStaff] = useState<Staff | null>(null)
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null)
  const [archivingStaff, setArchivingStaff] = useState<Staff | null>(null)
  const [unarchivingStaff, setUnarchivingStaff] = useState<Staff | null>(null)
  const [dataVersion, setDataVersion] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const departments = useMemo(() => flattenDepartmentNames(orgTree), [orgTree])

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [query])

  const refresh = useCallback(async () => {
    setError(null)
    const hasFilter = Boolean(debouncedQuery) || department !== 'All departments'
    const [filtered, all, tree, settings] = await Promise.all([
      staffApi.list({ query: debouncedQuery || undefined, department }),
      hasFilter ? staffApi.list() : Promise.resolve(undefined),
      departmentApi.tree(),
      settingsApi.get(),
    ])
    const allStaff = all ?? filtered
    setFilteredStaff(filtered)
    setStaff(allStaff)
    setOrgTree(tree)
    setOrganizationName(settings.organizationName)
    setDefaultExportFormat(settings.defaultExportFormat === 'CSV' ? 'CSV' : 'XLSX')
    setSelectedStaff((current) => (current ? allStaff.find((person) => person.id === current.id) ?? null : null))
    setDataVersion((current) => current + 1)
  }, [debouncedQuery, department])

  useEffect(() => {
    setIsLoading(true)
    refresh()
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not load staff records.'))
      .finally(() => setIsLoading(false))
  }, [refresh])

  useEffect(() => {
    function reload() {
      if (document.visibilityState !== 'visible') return
      void refresh().catch(() => undefined)
    }

    window.addEventListener('focus', reload)
    document.addEventListener('visibilitychange', reload)
    const timer = window.setInterval(reload, 15000)
    return () => {
      window.removeEventListener('focus', reload)
      document.removeEventListener('visibilitychange', reload)
      window.clearInterval(timer)
    }
  }, [refresh])

  function exportCsv() {
    const headers = ['Name', 'Staff ID', 'Designation', 'Department', 'Email', 'Phone', 'Gender', 'Status', 'Grade', 'Appointment date', 'Location']
    const rows = filteredStaff.map((p) => [p.name, p.staffId, p.designation, p.department, p.email, p.phone, p.gender, p.status, p.grade, p.appointmentDate, p.location])
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    link.download = 'smp-staff-directory.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  function exportXlsx() {
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(filteredStaff.map(({ id, photo, ...person }) => person)), 'Staff Directory')
    XLSX.writeFile(workbook, 'smp-staff-directory.xlsx')
  }

  function importFile(file: File) {
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const workbook = XLSX.read(event.target?.result, { type: 'array', cellDates: true })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)
        const imported: StaffFormValues[] = rows.map((row, index) => {
          const status = spreadsheetField(row, ['Status', 'status'], 'Active')
          return {
            name: spreadsheetField(row, ['Name', 'name'], 'Unnamed staff'),
            staffId: spreadsheetField(row, ['Staff ID', 'staffId'], `IMP-${index + 1}`),
            designation: spreadsheetField(row, ['Designation', 'designation'], 'Staff'),
            department: spreadsheetField(row, ['Department', 'department'], 'Planning and Design'),
            email: spreadsheetField(row, ['Email', 'email']),
            phone: spreadsheetField(row, ['Phone', 'phone']),
            gender: spreadsheetField(row, ['Gender', 'gender'], 'Not specified'),
            status: status === 'On leave' || status === 'Probation' ? status : 'Active',
            grade: spreadsheetField(row, ['Grade', 'grade'], 'Not specified'),
            appointmentDate: spreadsheetField(row, ['Appointment date', 'appointmentDate'], '01 Jan 2020'),
            location: spreadsheetField(row, ['Location', 'location'], 'Not specified'),
            nationality: spreadsheetField(row, ['Nationality', 'nationality'], 'Nigerian'),
            dob: spreadsheetField(row, ['DOB', 'dob']),
            maritalStatus: spreadsheetField(row, ['Marital status', 'maritalStatus'], 'Not specified'),
            ...emptyExtras(),
          }
        })
        await staffApi.importRows(imported)
        try {
          const mimeType = inferFileMimeType(file)
          const key = await uploadFileToS3(file, {
            kind: 'document',
            fileName: file.name,
            mimeType,
            category: 'STAFF_REGISTER',
          })
          await documentApi.create({
            category: 'STAFF_REGISTER',
            title: file.name,
            fileName: file.name,
            fileUrl: key,
            mimeType,
          })
        } catch {
          // Staff rows are already saved; archiving the spreadsheet is optional.
        }
        await refresh()
      } catch (err: unknown) {
        toastError(err, 'Could not read this file. Please upload a valid CSV or XLSX file.')
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

  async function saveStaff(values: StaffFormValues, photoFile?: File) {
    const photo = photoFile
      ? await uploadFileToS3(photoFile, {
          kind: 'photo',
          fileName: photoFile.name,
          mimeType: photoFile.type || 'image/jpeg',
          staffId: formStaff?.id,
        })
      : values.photo
    const payload = { ...values, photo }
    if (formStaff) {
      await staffApi.update(formStaff.id, payload)
    } else {
      await staffApi.create(payload)
    }
    closeForm()
    await refresh()
    router.push('/staff')
  }

  function requestDelete(person: Staff) {
    setDeletingStaff(person)
  }

  function cancelDelete() {
    setDeletingStaff(null)
  }

  async function confirmDelete() {
    if (!deletingStaff) return
    await staffApi.remove(deletingStaff.id)
    setDeletingStaff(null)
    await refresh()
  }

  function requestArchive(person: Staff) {
    setArchivingStaff(person)
  }

  function cancelArchive() {
    setArchivingStaff(null)
  }

  async function confirmArchive() {
    if (!archivingStaff) return
    await staffApi.archive(archivingStaff.id)
    setArchivingStaff(null)
    setSelectedStaff((current) => (current?.id === archivingStaff.id ? null : current))
    await refresh()
  }

  function requestUnarchive(person: Staff) {
    setUnarchivingStaff(person)
  }

  function cancelUnarchive() {
    setUnarchivingStaff(null)
  }

  async function confirmUnarchive() {
    if (!unarchivingStaff) return
    await staffApi.unarchive(unarchivingStaff.id)
    setUnarchivingStaff(null)
    await refresh()
  }

  function goToDepartment(nextDepartment: string) {
    setDepartment(nextDepartment)
    router.push('/staff')
  }

  const value: StaffContextValue = {
    staff,
    filteredStaff,
    isLoading,
    error,
    refresh,
    dataVersion,
    query,
    setQuery,
    department,
    setDepartment,
    departments,
    orgTree,
    organizationName,
    defaultExportFormat,
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
    archivingStaff,
    requestArchive,
    cancelArchive,
    confirmArchive,
    unarchivingStaff,
    requestUnarchive,
    cancelUnarchive,
    confirmUnarchive,
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
