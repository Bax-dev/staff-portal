import type { AuditAction } from '@prisma/client'

export type { AuditAction }

export type RequestActor = {
  id: string
  name: string
  email: string
}

export type AuditListQuery = {
  query?: string
  action?: AuditAction
  entityType?: string
}

export type CreateAuditLogInput = {
  actor?: RequestActor
  actorEmail?: string
  action: AuditAction
  entityType: string
  entityId?: string | null
  summary: string
  metadata?: Record<string, string | null>
}
