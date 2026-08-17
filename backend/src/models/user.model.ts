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
}
