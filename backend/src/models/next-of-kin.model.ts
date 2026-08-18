import type { Prisma } from '@prisma/client'
import { prisma } from '../config/database.js'

const notDeleted = { deletedAt: null } as const

export const nextOfKinModel = {
  findByStaffId(staffId: string) {
    return prisma.nextOfKin.findMany({
      where: { staffId, ...notDeleted },
      orderBy: { createdAt: 'desc' },
    })
  },

  findById(id: string) {
    return prisma.nextOfKin.findFirst({
      where: { id, ...notDeleted },
    })
  },

  create(data: Prisma.NextOfKinCreateInput) {
    return prisma.nextOfKin.create({ data })
  },

  update(id: string, data: Prisma.NextOfKinUpdateInput) {
    return prisma.nextOfKin.update({ where: { id }, data })
  },

  softDelete(id: string) {
    return prisma.nextOfKin.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  },
}
