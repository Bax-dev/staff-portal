import type { StaffStatus } from '@prisma/client'

export const staffStatusLabels = {
  ACTIVE: 'Active',
  ON_LEAVE: 'On leave',
  PROBATION: 'Probation',
} as const satisfies Record<StaffStatus, string>

export type StaffStatusLabel = (typeof staffStatusLabels)[StaffStatus]

export type StaffListQuery = {
  query?: string
  department?: string
  archived?: boolean
}

export type CreateStaffInput = {
  name: string
  title?: string
  staffId: string
  designation: string
  department: string
  email?: string
  phone?: string
  gender?: string
  status?: StaffStatusLabel
  grade?: string
  cadre?: string
  appointmentDate?: string
  location?: string
  nationality?: string
  dob?: string
  maritalStatus?: string
  nin?: string
  tin?: string
  pensionPin?: string
  bankName?: string
  accountNumber?: string
  bvn?: string
  ippis?: string
  pfa?: string
  bloodGroup?: string
  genotype?: string
  medicalFitness?: string
  photo?: string
}

export type UpdateStaffInput = Partial<CreateStaffInput>

export type StaffDto = {
  id: string
  name: string
  title: string
  designation: string
  department: string
  email: string
  phone: string
  gender: string
  status: StaffStatusLabel
  grade: string
  cadre: string
  appointmentDate: string
  location: string
  nationality: string
  dob: string
  maritalStatus: string
  staffId: string
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
  photo?: string
  archived: boolean
  archivedAt: string | null
}
