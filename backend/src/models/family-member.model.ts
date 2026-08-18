import type { Prisma } from '@prisma/client'
import { prisma } from '../config/database.js'

const notDeleted = { deletedAt: null } as const

export const familyMemberModel = {
  findByStaffId(staffId: string) {
    return prisma.familyMember.findMany({
      where: { staffId, ...notDeleted },
      orderBy: { createdAt: 'desc' },
    })
  },

  findById(id: string) {
    return prisma.familyMember.findFirst({
      where: { id, ...notDeleted },
    })
  },

  create(data: Prisma.FamilyMemberCreateInput) {
    return prisma.familyMember.create({ data })
  },

  update(id: string, data: Prisma.FamilyMemberUpdateInput) {
    return prisma.familyMember.update({ where: { id }, data })
  },

  softDelete(id: string) {
    return prisma.familyMember.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  },
}
