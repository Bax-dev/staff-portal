import { Archive, BarChart3, Building2, CircleHelp, FolderOpen, KeyRound, LayoutDashboard, ScrollText, Settings, Users, type LucideIcon } from 'lucide-react'
import type { Screen } from '@/lib/api/types'

export type Staff = {
  id: string
  name: string
  title: string
  designation: string
  department: string
  email: string
  phone: string
  gender: string
  status: 'Active' | 'On leave' | 'Probation'
  grade: string
  cadre: string
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

export const navItems: { label: string; href: string; icon: LucideIcon; screen?: Screen; adminOnly?: boolean }[] = [
  { label: 'Overview', href: '/', icon: LayoutDashboard, screen: 'OVERVIEW' },
  { label: 'Staff directory', href: '/staff', icon: Users, screen: 'DIRECTORY' },
  { label: 'Archive', href: '/archive', icon: Archive, screen: 'ARCHIVE' },
  { label: 'Organization', href: '/organization', icon: Building2, screen: 'ORGANIZATION' },
  { label: 'Documents', href: '/documents', icon: FolderOpen, screen: 'DOCUMENTS' },
  { label: 'Reports', href: '/reports', icon: BarChart3, screen: 'REPORTS' },
  { label: 'Audit log', href: '/audit-log', icon: ScrollText, screen: 'AUDIT_LOG' },
  { label: 'Settings', href: '/settings', icon: Settings, screen: 'SETTINGS' },
  { label: 'Staff access', href: '/staff-access', icon: KeyRound, adminOnly: true },
  { label: 'Help center', href: '/help', icon: CircleHelp },
]

export const screenLabels: Record<Screen, string> = {
  OVERVIEW: 'Overview',
  DIRECTORY: 'Staff directory',
  ARCHIVE: 'Archive',
  ORGANIZATION: 'Organization',
  DOCUMENTS: 'Documents',
  REPORTS: 'Reports',
  AUDIT_LOG: 'Audit log',
  SETTINGS: 'Settings',
}

export const allScreens: Screen[] = Object.keys(screenLabels) as Screen[]

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
