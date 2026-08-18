import type { Department, Staff, StaffStatus } from '@prisma/client'
import { formatDisplayDate, parseDisplayDate } from '../utils/dates.js'
import { AppError } from '../utils/errors.js'
import { staffStatusLabels, type CreateStaffInput, type StaffDto, type StaffStatusLabel } from '../types/staff.js'

const statusByLabel = Object.fromEntries(
  Object.entries(staffStatusLabels).map(([status, label]) => [label, status]),
) as Record<StaffStatusLabel, StaffStatus>

type StaffWithDepartment = Staff & { department: Department }

function orPlaceholder(value: string | null | undefined) {
  return value?.trim() || 'Not provided'
}

export function toStaffDto(staff: StaffWithDepartment): StaffDto {
  return {
    id: staff.id,
    name: staff.name,
    designation: staff.designation,
    department: staff.department.name,
    email: staff.email,
    phone: staff.phone,
    gender: staff.gender,
    status: staffStatusLabels[staff.status],
    grade: staff.grade,
    appointmentDate: formatDisplayDate(staff.appointmentDate),
    location: staff.location,
    nationality: staff.nationality,
    dob: formatDisplayDate(staff.dateOfBirth),
    maritalStatus: staff.maritalStatus,
    staffId: staff.staffCode,
    nin: orPlaceholder(staff.nin),
    tin: orPlaceholder(staff.tin),
    pensionPin: orPlaceholder(staff.pensionPin),
    bankName: orPlaceholder(staff.bankName),
    accountNumber: orPlaceholder(staff.accountNumber),
    bvn: orPlaceholder(staff.bvn),
    ippis: orPlaceholder(staff.ippis),
    pfa: orPlaceholder(staff.pfa),
    bloodGroup: orPlaceholder(staff.bloodGroup),
    genotype: orPlaceholder(staff.genotype),
    medicalFitness: orPlaceholder(staff.medicalFitness),
    photo: staff.photo ?? undefined,
    archived: staff.archivedAt != null,
    archivedAt: staff.archivedAt ? staff.archivedAt.toISOString() : null,
  }
}

export function parseStaffStatus(status?: StaffStatusLabel) {
  if (!status) return undefined
  const parsed = statusByLabel[status]
  if (!parsed) {
    throw new AppError(400, `Invalid staff status: ${status}`)
  }
  return parsed
}

export function toStaffWriteData(input: CreateStaffInput, departmentId: string) {
  return {
    staffCode: input.staffId,
    name: input.name,
    designation: input.designation,
    departmentId,
    email: input.email ?? '',
    phone: input.phone ?? '',
    gender: input.gender ?? 'Not specified',
    status: parseStaffStatus(input.status) ?? 'ACTIVE',
    grade: input.grade ?? 'Not specified',
    appointmentDate: input.appointmentDate ? parseDisplayDate(input.appointmentDate) : new Date(),
    location: input.location ?? 'Not specified',
    nationality: input.nationality ?? 'Nigerian',
    dateOfBirth: input.dob ? parseDisplayDate(input.dob) : null,
    maritalStatus: input.maritalStatus ?? 'Not specified',
    nin: input.nin,
    tin: input.tin,
    pensionPin: input.pensionPin,
    bankName: input.bankName,
    accountNumber: input.accountNumber,
    bvn: input.bvn,
    ippis: input.ippis,
    pfa: input.pfa,
    bloodGroup: input.bloodGroup,
    genotype: input.genotype,
    medicalFitness: input.medicalFitness,
    photo: input.photo,
  }
}
