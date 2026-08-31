import type { Prisma } from '@prisma/client'
import { prisma } from '../config/database.js'

const notDeleted = { deletedAt: null } as const

export const userModel = {
  findByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email: email.toLowerCase(), ...notDeleted },
    })
  },

  findById(id: string) {
    return prisma.user.findFirst({
      where: { id, ...notDeleted },
    })
  },

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data })
  },

  update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data })
  },

  findByStaffId(staffId: string) {
    return prisma.user.findUnique({ where: { staffId } })
  },

  findByEmailAny(email: string) {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  },

  // Unlike findById, this does not filter out soft-deleted accounts — account
  // management screens need to find/act on deactivated users too (e.g. to
  // reactivate them or inspect their permissions).
  findAccountById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        staff: { select: { name: true, designation: true } },
        permissions: true,
      },
    })
  },

  listAccounts() {
    return prisma.user.findMany({
      where: { staffId: { not: null } },
      include: {
        staff: { select: { name: true, designation: true } },
        permissions: true,
      },
      orderBy: { staff: { name: 'asc' } },
    })
  },
}
