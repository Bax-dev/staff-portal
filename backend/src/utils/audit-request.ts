import type { Request } from 'express'
import type { AuditAction } from '../types/audit.js'

const childEntities: Record<string, string> = {
  education: 'Education',
  certifications: 'Certification',
  family: 'Family member',
  'emergency-contacts': 'Emergency contact',
  'next-of-kin': 'Next of kin',
  'service-history': 'Service history',
}

export type AuditRequestDescription = {
  action: AuditAction
  entityType: string
  entityId: string | null
  summary: string
}

export function requestPath(req: Request) {
  return (req.originalUrl ?? req.url).split('?')[0] ?? ''
}

export function describeAuditRequest(req: Request): AuditRequestDescription | null {
  const method = req.method.toUpperCase()
  if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) return null

  const parts = requestPath(req).replace(/^\/api\/?/, '').split('/').filter(Boolean)
  if (parts.length === 0) return null

  const [resource, ...rest] = parts

  if (
    resource === 'audit-logs' ||
    resource === 'uploads' ||
    resource === 'notifications' ||
    resource === 'reports' ||
    resource === 'departments'
  ) {
    return null
  }

  if (resource === 'auth') {
    if (method === 'POST' && rest[0] === 'login') {
      return { action: 'LOGIN', entityType: 'User', entityId: null, summary: 'Signed in' }
    }
    if (method === 'POST' && rest[0] === 'otp' && rest[1] === 'verify') {
      return { action: 'LOGIN', entityType: 'User', entityId: null, summary: 'Signed in with OTP' }
    }
    if (method === 'POST' && rest[0] === 'reset-password') {
      return { action: 'UPDATE', entityType: 'User', entityId: null, summary: 'Reset account password' }
    }
    if (method === 'PATCH' && rest[0] === 'me') {
      return { action: 'UPDATE', entityType: 'User', entityId: null, summary: 'Updated account profile' }
    }
    if (method === 'POST' && rest[0] === 'change-password') {
      return { action: 'UPDATE', entityType: 'User', entityId: null, summary: 'Changed account password' }
    }
    return null
  }

  if (resource === 'staff') {
    if (rest[0] === 'import' && method === 'POST') {
      return { action: 'IMPORT', entityType: 'Staff', entityId: null, summary: 'Imported staff records' }
    }

    if (rest.length === 0 && method === 'POST') {
      return { action: 'CREATE', entityType: 'Staff', entityId: null, summary: 'Created a staff record' }
    }

    const staffId = rest[0] ?? null
    const child = rest[1]
    const childId = rest[2] ?? null

    if (child && childEntities[child]) {
      const entityType = childEntities[child]
      const action: AuditAction = method === 'POST' ? 'CREATE' : method === 'DELETE' ? 'DELETE' : 'UPDATE'
      const verb = action === 'CREATE' ? 'Added' : action === 'DELETE' ? 'Removed' : 'Updated'
      return {
        action,
        entityType,
        entityId: childId ?? staffId,
        summary: `${verb} ${entityType.toLowerCase()} for a staff record`,
      }
    }

    if (child === 'archive' && method === 'POST') {
      return { action: 'ARCHIVE', entityType: 'Staff', entityId: staffId, summary: 'Archived a staff record' }
    }
    if (child === 'unarchive' && method === 'POST') {
      return { action: 'UNARCHIVE', entityType: 'Staff', entityId: staffId, summary: 'Restored a staff record from archive' }
    }

    if (method === 'PATCH' && staffId) {
      return { action: 'UPDATE', entityType: 'Staff', entityId: staffId, summary: 'Updated a staff record' }
    }
    if (method === 'DELETE' && staffId) {
      return { action: 'DELETE', entityType: 'Staff', entityId: staffId, summary: 'Removed a staff record' }
    }
    return null
  }

  if (resource === 'documents') {
    if (method === 'POST') {
      return { action: 'CREATE', entityType: 'Document', entityId: null, summary: 'Uploaded a document' }
    }
    if (method === 'DELETE') {
      return { action: 'DELETE', entityType: 'Document', entityId: rest[0] ?? null, summary: 'Removed a document' }
    }
    return null
  }

  if (resource === 'settings' && method === 'PATCH') {
    return { action: 'UPDATE', entityType: 'Settings', entityId: null, summary: 'Updated workspace settings' }
  }

  return null
}

export function extractEntityId(body: unknown): string | null {
  if (!body || typeof body !== 'object' || !('data' in body)) return null
  const data = (body as { data: unknown }).data
  if (Array.isArray(data)) return null
  if (!data || typeof data !== 'object' || !('id' in data)) return null
  const id = (data as { id: unknown }).id
  return typeof id === 'string' ? id : null
}

export function bodyEmail(body: unknown): string | null {
  if (!body || typeof body !== 'object' || !('email' in body)) return null
  const email = (body as { email: unknown }).email
  return typeof email === 'string' ? email : null
}
