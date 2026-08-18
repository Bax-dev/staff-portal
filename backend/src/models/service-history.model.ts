import type { Prisma } from '@prisma/client'
import { prisma } from '../config/database.js'

const notDeleted = { deletedAt: null } as const

export const serviceHistoryModel = {
  findMany(args: Prisma.ServiceHistoryFindManyArgs = {}) {
    return prisma.serviceHistory.findMany({
      orderBy: { effectiveDate: 'desc' },
      ...args,
      where: {
        ...args.where,
        ...notDeleted,
      },
    })
  },

  findByStaffId(staffId: string) {
    return this.findMany({ where: { staffId } })
  },

  findById(id: string) {
    return prisma.serviceHistory.findFirst({
      where: { id, ...notDeleted },
    })
  },

  create(data: Prisma.ServiceHistoryCreateInput) {
    return prisma.serviceHistory.create({ data })
  },

  update(id: string, data: Prisma.ServiceHistoryUpdateInput) {
    return prisma.serviceHistory.update({ where: { id }, data })
  },

  softDelete(id: string) {
    return prisma.serviceHistory.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  },
}
