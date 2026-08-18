import { Archive, BarChart3, Building2, CircleHelp, FolderOpen, LayoutDashboard, ScrollText, Settings, Users, type LucideIcon } from 'lucide-react'

export type Staff = {
  id: string
  name: string
  designation: string
  department: string
  email: string
  phone: string
  gender: string
  status: 'Active' | 'On leave' | 'Probation'
  grade: string
  appointmentDate: string
  location: string
  nationality: string
  dob: string
  maritalStatus: string
  staffId: string
  photo?: string
  nin: string
  tin: string
  pensionPin: string
  bankName: string
  accountNumber: string
  bvn: string
  ippis: string
  pfa: string
  bloodGroup: string
  genotype: string
  medicalFitness: string
  archived?: boolean
  archivedAt?: string | null
}

export type StaffFormValues = Omit<Staff, 'id' | 'archived' | 'archivedAt'>

export const navItems: { label: string; href: string; icon: LucideIcon }[] = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Staff directory', href: '/staff', icon: Users },
  { label: 'Archive', href: '/archive', icon: Archive },
  { label: 'Organization', href: '/organization', icon: Building2 },
  { label: 'Documents', href: '/documents', icon: FolderOpen },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Audit log', href: '/audit-log', icon: ScrollText },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Help center', href: '/help', icon: CircleHelp },
]

export function initials(name: string) {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('')
}

export function escapeCsv(value: string) {
  return `"${String(value).replaceAll('"', '""')}"`
}

export function flattenDepartmentNames(tree: Array<{ name: string; children: Array<{ name: string; children: Array<{ name: string }> }> }>) {
  return tree.flatMap((root) => [
    root.name,
    ...root.children.flatMap((branch) => [branch.name, ...branch.children.map((unit) => unit.name)]),
  ])
}

export function spreadsheetValue(value: unknown): string {
  if (value == null || value === '') return ''
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  return String(value).trim()
}

export function spreadsheetField(row: Record<string, unknown>, keys: string[], fallback = ''): string {
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(row, key)) continue
    const text = spreadsheetValue(row[key])
    if (text) return text
  }
  return fallback
}
