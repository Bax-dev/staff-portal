import type { Role } from '@/lib/auth'
import type { Staff } from '@/lib/staff-data'

export type AppearanceTheme = 'light' | 'dark'
export type AppearanceFontSize = 'small' | 'medium' | 'large' | 'xlarge'

export type AuthUser = {
  id: string
  email: string
  name: string
  role: Role
  staffId: string | null
  photo?: string | null
  theme?: AppearanceTheme
  fontSize?: AppearanceFontSize
}

export type AuthSession = {
  token: string
  user: AuthUser
}

export type DepartmentNode = {
  id: string
  name: string
  children: Array<{
    id: string
    name: string
    children: Array<{ id: string; name: string }>
  }>
}

export type DepartmentListItem = {
  id: string
  name: string
  parentId: string | null
  children: Array<{ id: string; name: string }>
}

export type OverviewReport = {
  totalStaff: number
  activeStaff: number
  departments: number
  recentStaff: Staff[]
}

export type WorkforceReport = {
  active: number
  female: number
  male: number
  onLeave: number
  byDepartment: Record<string, number>
}

export type WorkspaceSettings = {
  id: string
  organizationName: string
  defaultExportFormat: 'CSV' | 'XLSX' | string
  updatedAt: string
}

export type DocumentCategory = 'STAFF_REGISTER' | 'IDENTITY' | 'SERVICE_HISTORY'

export type StaffDocument = {
  id: string
  staffId: string | null
  category: DocumentCategory
  title: string
  fileName: string
  fileUrl: string
  mimeType: string
  createdAt: string
}

export type PresignUploadResult = {
  key: string
  uploadUrl: string
  method: 'PUT'
  headers: { 'Content-Type': string }
  expiresInSeconds: number
  maxBytes: number
  objectUrl: string
}

export type AppNotification = {
  id: string
  userId: string
  title: string
  body: string
  readAt: string | null
  createdAt: string
}

export type EducationRecord = {
  id: string
  staffId: string
  institution: string
  qualification: string
  fieldOfStudy: string | null
  startDate: string | null
  endDate: string | null
}

export type CertificationRecord = {
  id: string
  staffId: string
  name: string
  issuer: string
  issuedDate: string | null
  expiryDate: string | null
  certificateNumber: string | null
}

export type FamilyMemberRecord = {
  id: string
  staffId: string
  name: string
  relationship: string
  dateOfBirth: string | null
  gender: string | null
  phone: string | null
}

export type EmergencyContactRecord = {
  id: string
  staffId: string
  name: string
  relationship: string
  phone: string
  email: string | null
  address: string | null
}

export type NextOfKinRecord = {
  id: string
  staffId: string
  name: string
  relationship: string
  phone: string
  address: string | null
}

export type ServiceHistoryRecord = {
  id: string
  staffId: string
  type: 'PROMOTION' | 'POSTING' | 'TRANSFER' | 'LEAVE'
  title: string
  details: string | null
  effectiveDate: string
  staffName?: string
  staffCode?: string
}

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'IMPORT' | 'ARCHIVE' | 'UNARCHIVE'

export type AuditLog = {
  id: string
  actorId: string | null
  actorName: string
  actorEmail: string | null
  action: AuditAction
  entityType: string
  entityId: string | null
  summary: string
  createdAt: string
}
