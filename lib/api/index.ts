import { api } from '@/lib/api/client'
import type { Staff, StaffFormValues } from '@/lib/staff-data'
import type {
  AppearanceFontSize,
  AppearanceTheme,
  AppNotification,
  AuditAction,
  AuditLog,
  AuthSession,
  AuthUser,
  CertificationRecord,
  DepartmentListItem,
  DepartmentNode,
  DocumentCategory,
  EducationRecord,
  EmergencyContactRecord,
  FamilyMemberRecord,
  NextOfKinRecord,
  OverviewReport,
  PresignUploadResult,
  ServiceHistoryRecord,
  StaffDocument,
  WorkforceReport,
  WorkspaceSettings,
} from '@/lib/api/types'
import type { Role } from '@/lib/auth'

export const authApi = {
  login(input: { email: string; password: string; role: Role }) {
    return api<AuthSession>('/api/auth/login', { method: 'POST', body: JSON.stringify(input) })
  },
  forgotPassword(email: string) {
    return api<{ email: string; expiresInSeconds: number }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },
  resetPassword(token: string, password: string) {
    return api<{ reset: boolean }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    })
  },
  requestOtp(email: string) {
    return api<{ email: string; expiresInSeconds: number }>('/api/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },
  verifyOtp(email: string, code: string) {
    return api<AuthSession>('/api/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    })
  },
  me() {
    return api<AuthUser>('/api/auth/me')
  },
  updateProfile(input: {
    name?: string
    photo?: string | null
    theme?: AppearanceTheme
    fontSize?: AppearanceFontSize
  }) {
    return api<AuthUser>('/api/auth/me', { method: 'PATCH', body: JSON.stringify(input) })
  },
  changePassword(currentPassword: string, newPassword: string) {
    return api<{ updated: boolean }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  },
}

export const staffApi = {
  list(params?: { query?: string; department?: string; archived?: boolean }) {
    const search = new URLSearchParams()
    if (params?.query?.trim()) search.set('query', params.query.trim())
    if (params?.department && params.department !== 'All departments') {
      search.set('department', params.department)
    }
    if (params?.archived) search.set('archived', 'true')
    const suffix = search.toString() ? `?${search.toString()}` : ''
    return api<Staff[]>(`/api/staff${suffix}`)
  },
  get(id: string) {
    return api<Staff>(`/api/staff/${id}`)
  },
  create(input: StaffFormValues) {
    return api<Staff>('/api/staff', { method: 'POST', body: JSON.stringify(input) })
  },
  update(id: string, input: Partial<StaffFormValues>) {
    return api<Staff>(`/api/staff/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
  },
  remove(id: string) {
    return api<void>(`/api/staff/${id}`, { method: 'DELETE' })
  },
  archive(id: string) {
    return api<Staff>(`/api/staff/${id}/archive`, { method: 'POST' })
  },
  unarchive(id: string) {
    return api<Staff>(`/api/staff/${id}/unarchive`, { method: 'POST' })
  },
  importRows(rows: StaffFormValues[]) {
    return api<Staff[]>('/api/staff/import', { method: 'POST', body: JSON.stringify({ rows }) })
  },
}

export const departmentApi = {
  list() {
    return api<DepartmentListItem[]>('/api/departments')
  },
  tree() {
    return api<DepartmentNode[]>('/api/departments/tree')
  },
}

export const reportApi = {
  overview() {
    return api<OverviewReport>('/api/reports/overview')
  },
  workforce() {
    return api<WorkforceReport>('/api/reports/workforce')
  },
}

export const settingsApi = {
  get() {
    return api<WorkspaceSettings>('/api/settings')
  },
  update(input: { organizationName?: string; defaultExportFormat?: 'CSV' | 'XLSX' }) {
    return api<WorkspaceSettings>('/api/settings', { method: 'PATCH', body: JSON.stringify(input) })
  },
}

export const documentApi = {
  list(params?: { category?: DocumentCategory; staffId?: string }) {
    const query = new URLSearchParams()
    if (params?.category) query.set('category', params.category)
    if (params?.staffId) query.set('staffId', params.staffId)
    const suffix = query.toString() ? `?${query.toString()}` : ''
    return api<StaffDocument[]>(`/api/documents${suffix}`)
  },
  create(input: {
    staffId?: string
    category: DocumentCategory
    title: string
    fileName: string
    fileUrl: string
    mimeType: string
  }) {
    return api<StaffDocument>('/api/documents', { method: 'POST', body: JSON.stringify(input) })
  },
  remove(id: string) {
    return api<void>(`/api/documents/${id}`, { method: 'DELETE' })
  },
}

export const uploadApi = {
  presign(input: {
    kind: 'photo' | 'document'
    fileName: string
    mimeType: string
    staffId?: string
    category?: DocumentCategory
  }) {
    return api<PresignUploadResult>('/api/uploads/presign', { method: 'POST', body: JSON.stringify(input) })
  },
  downloadUrl(key: string) {
    return api<{ key: string; downloadUrl: string; expiresInSeconds: number }>('/api/uploads/download-url', {
      method: 'POST',
      body: JSON.stringify({ key }),
    })
  },
}

const mimeByExtension: Record<string, string> = {
  csv: 'text/csv',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
}

export function inferFileMimeType(file: File, fallback = 'application/octet-stream') {
  if (file.type && file.type !== 'application/octet-stream') return file.type
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  return mimeByExtension[extension] ?? (file.type || fallback)
}

export async function uploadFileToS3(file: File, input: Parameters<typeof uploadApi.presign>[0]) {
  const mimeType = inferFileMimeType(file, input.mimeType)
  const presign = await uploadApi.presign({ ...input, fileName: file.name, mimeType })
  const response = await fetch(presign.uploadUrl, {
    method: 'PUT',
    headers: presign.headers,
    body: file,
  })
  if (!response.ok) {
    throw new Error('Could not upload the file.')
  }
  return presign.key
}

const mediaUrlCache = new Map<string, string>()

export async function resolveMediaUrl(key?: string) {
  if (!key) return undefined
  if (key.startsWith('data:') || key.startsWith('http://') || key.startsWith('https://') || key.startsWith('blob:')) {
    return key
  }
  const cached = mediaUrlCache.get(key)
  if (cached) return cached
  const result = await uploadApi.downloadUrl(key)
  mediaUrlCache.set(key, result.downloadUrl)
  return result.downloadUrl
}

export const notificationApi = {
  list(userId: string, unreadOnly = false) {
    const query = new URLSearchParams({ userId })
    if (unreadOnly) query.set('unreadOnly', 'true')
    return api<AppNotification[]>(`/api/notifications?${query.toString()}`)
  },
  create(input: { userId: string; title: string; body: string }) {
    return api<AppNotification>('/api/notifications', { method: 'POST', body: JSON.stringify(input) })
  },
  markRead(id: string) {
    return api<AppNotification>(`/api/notifications/${id}/read`, { method: 'PATCH' })
  },
  remove(id: string) {
    return api<void>(`/api/notifications/${id}`, { method: 'DELETE' })
  },
}

function staffRecordApi<T>(segment: string) {
  return {
    list(staffId: string) {
      return api<T[]>(`/api/staff/${staffId}/${segment}`)
    },
    create(staffId: string, input: Record<string, string | undefined>) {
      return api<T>(`/api/staff/${staffId}/${segment}`, { method: 'POST', body: JSON.stringify(input) })
    },
    update(staffId: string, id: string, input: Record<string, string | undefined>) {
      return api<T>(`/api/staff/${staffId}/${segment}/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
    },
    remove(staffId: string, id: string) {
      return api<void>(`/api/staff/${staffId}/${segment}/${id}`, { method: 'DELETE' })
    },
  }
}

export const educationApi = staffRecordApi<EducationRecord>('education')
export const certificationApi = staffRecordApi<CertificationRecord>('certifications')
export const familyApi = staffRecordApi<FamilyMemberRecord>('family')
export const emergencyContactApi = staffRecordApi<EmergencyContactRecord>('emergency-contacts')
export const nextOfKinApi = staffRecordApi<NextOfKinRecord>('next-of-kin')
export const serviceHistoryApi = {
  ...staffRecordApi<ServiceHistoryRecord>('service-history'),
  listAll() {
    return api<ServiceHistoryRecord[]>('/api/service-history')
  },
}

export const auditApi = {
  list(params?: { query?: string; action?: AuditAction; entityType?: string }) {
    const search = new URLSearchParams()
    if (params?.query?.trim()) search.set('query', params.query.trim())
    if (params?.action) search.set('action', params.action)
    if (params?.entityType) search.set('entityType', params.entityType)
    const suffix = search.toString() ? `?${search.toString()}` : ''
    return api<AuditLog[]>(`/api/audit-logs${suffix}`)
  },
}
