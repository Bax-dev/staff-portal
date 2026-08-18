import type { Prisma } from '@prisma/client'
import { prisma } from '../config/database.js'

const notDeleted = { deletedAt: null } as const

export const emergencyContactModel = {
  findByStaffId(staffId: string) {
    return prisma.emergencyContact.findMany({
      where: { staffId, ...notDeleted },
      orderBy: { createdAt: 'desc' },
    })
  },

  findById(id: string) {
    return prisma.emergencyContact.findFirst({
      where: { id, ...notDeleted },
    })
  },

  create(data: Prisma.EmergencyContactCreateInput) {
    return prisma.emergencyContact.create({ data })
  },

  update(id: string, data: Prisma.EmergencyContactUpdateInput) {
    return prisma.emergencyContact.update({ where: { id }, data })
  },

  softDelete(id: string) {
    return prisma.emergencyContact.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  },
}
