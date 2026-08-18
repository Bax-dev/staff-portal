import type { Prisma } from '@prisma/client'
import { prisma } from '../config/database.js'

const notDeleted = { deletedAt: null } as const

export const certificationModel = {
  findByStaffId(staffId: string) {
    return prisma.certification.findMany({
      where: { staffId, ...notDeleted },
      orderBy: { createdAt: 'desc' },
    })
  },

  findById(id: string) {
    return prisma.certification.findFirst({
      where: { id, ...notDeleted },
    })
  },

  create(data: Prisma.CertificationCreateInput) {
    return prisma.certification.create({ data })
  },

  update(id: string, data: Prisma.CertificationUpdateInput) {
    return prisma.certification.update({ where: { id }, data })
  },

  softDelete(id: string) {
    return prisma.certification.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  },
}
