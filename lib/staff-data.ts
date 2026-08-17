import { BarChart3, Building2, CircleHelp, FolderOpen, LayoutDashboard, Settings, Users, type LucideIcon } from 'lucide-react'

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
}

export const orgUnits = [
  { name: 'Planning and Budget', children: ['Monitoring and Evaluation', 'Project Planning', 'ICT', 'Budget'] },
  { name: 'Investigation and Design', children: ['Investigation', 'Design', 'Survey', 'Laboratory'] },
  { name: 'Hydrology', children: ['Integrated River Basin Management (IRBM)', 'Hydromet'] },
]

export const initialStaff: Staff[] = [
  { id: '1', name: 'Engr. Amina Yusuf', designation: 'Director, Planning and Design', department: 'Planning and Design', email: 'amina.yusuf@organo.gov.ng', phone: '+234 803 445 1200', gender: 'Female', status: 'Active', grade: 'GL 17 / Step 9', appointmentDate: '14 Feb 2018', location: 'Abuja', nationality: 'Nigerian', dob: '22 Jun 1975', maritalStatus: 'Married', staffId: 'PD-001' },
  { id: '2', name: 'Mr. Chinedu Okafor', designation: 'Deputy Director, Budget', department: 'Planning and Budget', email: 'chinedu.okafor@organo.gov.ng', phone: '+234 806 110 2288', gender: 'Male', status: 'Active', grade: 'GL 16 / Step 7', appointmentDate: '02 Sep 2019', location: 'Abuja', nationality: 'Nigerian', dob: '04 Mar 1981', maritalStatus: 'Married', staffId: 'PB-014' },
  { id: '3', name: 'Mrs. Fatima Bello', designation: 'Chief Planning Officer', department: 'Planning and Budget', email: 'fatima.bello@organo.gov.ng', phone: '+234 809 552 3901', gender: 'Female', status: 'On leave', grade: 'GL 15 / Step 5', appointmentDate: '11 Nov 2020', location: 'Kaduna', nationality: 'Nigerian', dob: '18 Oct 1984', maritalStatus: 'Married', staffId: 'PB-021' },
  { id: '4', name: 'Dr. Ibrahim Musa', designation: 'Chief Hydrologist', department: 'Hydrology', email: 'ibrahim.musa@organo.gov.ng', phone: '+234 802 770 4412', gender: 'Male', status: 'Active', grade: 'GL 15 / Step 8', appointmentDate: '08 May 2017', location: 'Kano', nationality: 'Nigerian', dob: '09 Jan 1978', maritalStatus: 'Married', staffId: 'HY-003' },
  { id: '5', name: 'Ms. Grace Eze', designation: 'Senior Investigation Officer', department: 'Investigation and Design', email: 'grace.eze@organo.gov.ng', phone: '+234 807 229 6540', gender: 'Female', status: 'Probation', grade: 'GL 13 / Step 2', appointmentDate: '19 Jan 2025', location: 'Enugu', nationality: 'Nigerian', dob: '27 Aug 1990', maritalStatus: 'Single', staffId: 'ID-018' },
  { id: '6', name: 'Mr. Tunde Adeyemi', designation: 'ICT Manager', department: 'ICT', email: 'tunde.adeyemi@organo.gov.ng', phone: '+234 805 994 3310', gender: 'Male', status: 'Active', grade: 'GL 14 / Step 6', appointmentDate: '27 Jul 2021', location: 'Ibadan', nationality: 'Nigerian', dob: '12 Dec 1986', maritalStatus: 'Married', staffId: 'ICT-006' },
]

export const navItems: { label: string; href: string; icon: LucideIcon }[] = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Staff directory', href: '/staff', icon: Users },
  { label: 'Organization', href: '/organization', icon: Building2 },
  { label: 'Documents', href: '/documents', icon: FolderOpen },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Help center', href: '/help', icon: CircleHelp },
]

export function initials(name: string) {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('')
}

export function escapeCsv(value: string) {
  return `"${String(value).replaceAll('"', '""')}"`
}

export function allDepartments() {
  return ['Planning and Design', ...orgUnits.flatMap((unit) => [unit.name, ...unit.children])].filter(
    (value, index, array) => array.indexOf(value) === index,
  )
}
