import type { Prisma } from '@prisma/client'
import { prisma } from '../config/database.js'

const notDeleted = { deletedAt: null } as const

export const serviceHistoryModel = {
  findMany<T extends Prisma.ServiceHistoryFindManyArgs>(args: Prisma.Exact<T, Prisma.ServiceHistoryFindManyArgs> = {} as Prisma.Exact<T, Prisma.ServiceHistoryFindManyArgs>) {
    return prisma.serviceHistory.findMany({
      orderBy: { effectiveDate: 'desc' },
      ...args,
      where: {
        ...(args as Prisma.ServiceHistoryFindManyArgs).where,
        ...notDeleted,
      },
    }) as Prisma.PrismaPromise<Prisma.ServiceHistoryGetPayload<T>[]>
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
