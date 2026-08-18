import type { Prisma } from '@prisma/client'
import { auditLogModel } from '../models/audit-log.model.js'
import { userModel } from '../models/user.model.js'
import type { AuditListQuery, CreateAuditLogInput } from '../types/audit.js'

function toAuditDto(log: {
  id: string
  actorId: string | null
  actorName: string
  actorEmail: string | null
  action: CreateAuditLogInput['action']
  entityType: string
  entityId: string | null
  summary: string
  createdAt: Date
}) {
  return {
    id: log.id,
    actorId: log.actorId,
    actorName: log.actorName,
    actorEmail: log.actorEmail,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    summary: log.summary,
    createdAt: log.createdAt.toISOString(),
  }
}

export const auditService = {
  async list({ query, action, entityType }: AuditListQuery) {
    const where: Prisma.AuditLogWhereInput = {
      ...(action ? { action } : {}),
      ...(entityType ? { entityType } : {}),
    }

    if (query?.trim()) {
      const term = query.trim()
      where.OR = [
        { summary: { contains: term, mode: 'insensitive' } },
        { actorName: { contains: term, mode: 'insensitive' } },
        { actorEmail: { contains: term, mode: 'insensitive' } },
        { entityType: { contains: term, mode: 'insensitive' } },
        { entityId: { contains: term, mode: 'insensitive' } },
      ]
    }

    const logs = await auditLogModel.findMany({ where })
    return logs.map(toAuditDto)
  },

  async record(input: CreateAuditLogInput) {
    let actor = input.actor
    if (!actor && input.actorEmail) {
      const user = await userModel.findByEmail(input.actorEmail)
      if (user) {
        actor = { id: user.id, name: user.name, email: user.email }
      }
    }

    const log = await auditLogModel.create({
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? undefined,
      summary: input.summary,
      actorName: actor?.name ?? 'System',
      actorEmail: actor?.email ?? input.actorEmail ?? undefined,
      metadata: input.metadata,
      ...(actor ? { actor: { connect: { id: actor.id } } } : {}),
    })

    return toAuditDto(log)
  },
}
