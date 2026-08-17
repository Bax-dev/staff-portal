import type { Prisma } from '@prisma/client'
import { prisma } from '../config/database.js'
import { appendDeletedAt } from '../utils/soft-delete.js'

const notDeleted = { deletedAt: null } as const

export const documentModel = {
  findMany(args: Prisma.DocumentFindManyArgs = {}) {
    return prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      ...args,
      where: {
        ...args.where,
        ...notDeleted,
      },
    })
  },

  findById(id: string) {
    return prisma.document.findFirst({
      where: { id, ...notDeleted },
    })
  },

  create(data: Prisma.DocumentCreateInput) {
    return prisma.document.create({ data })
  },

  softDelete(id: string) {
    const deletedAt = new Date()

    return prisma.$transaction(async (tx) => {
      const current = await tx.document.findFirst({
        where: { id, ...notDeleted },
      })

      if (!current) {
        return null
      }

      return tx.document.update({
        where: { id },
        data: {
          deletedAt,
          fileName: appendDeletedAt(current.fileName, deletedAt),
        },
      })
    })
  },
}
