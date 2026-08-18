import type { Prisma } from '@prisma/client'
import { prisma } from '../config/database.js'

const notDeleted = { deletedAt: null } as const

export const educationModel = {
  findByStaffId(staffId: string) {
    return prisma.education.findMany({
      where: { staffId, ...notDeleted },
      orderBy: { createdAt: 'desc' },
    })
  },

  findById(id: string) {
    return prisma.education.findFirst({
      where: { id, ...notDeleted },
    })
  },

  create(data: Prisma.EducationCreateInput) {
    return prisma.education.create({ data })
  },

  update(id: string, data: Prisma.EducationUpdateInput) {
    return prisma.education.update({ where: { id }, data })
  },

  softDelete(id: string) {
    return prisma.education.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  },
}
