import type { Prisma } from '@prisma/client'
import { prisma } from '../config/database.js'

export const auditLogModel = {
  findMany(args: Prisma.AuditLogFindManyArgs = {}) {
    return prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      ...args,
    })
  },

  create(data: Prisma.AuditLogCreateInput) {
    return prisma.auditLog.create({ data })
  },
}
