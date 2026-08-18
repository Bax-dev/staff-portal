import type { Prisma } from '@prisma/client'
import { prisma } from '../config/database.js'

const notDeleted = { deletedAt: null } as const

export const notificationModel = {
  findMany(args: Prisma.NotificationFindManyArgs = {}) {
    return prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      ...args,
      where: {
        ...args.where,
        ...notDeleted,
      },
    })
  },

  findById(id: string) {
    return prisma.notification.findFirst({
      where: { id, ...notDeleted },
    })
  },

  create(data: Prisma.NotificationCreateInput) {
    return prisma.notification.create({ data })
  },

  update(id: string, data: Prisma.NotificationUpdateInput) {
    return prisma.notification.update({ where: { id }, data })
  },

  softDelete(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  },
}
