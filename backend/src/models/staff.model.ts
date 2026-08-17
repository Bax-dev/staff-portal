import type { Prisma } from '@prisma/client'
import { prisma } from '../config/database.js'
import { appendDeletedAt } from '../utils/soft-delete.js'

const staffInclude = {
  department: true,
  documents: {
    where: { deletedAt: null },
  },
  serviceHistory: true,
  nextOfKin: true,
} satisfies Prisma.StaffInclude

const notDeleted = { deletedAt: null } as const

export const staffModel = {
  findMany(args: Prisma.StaffFindManyArgs) {
    return prisma.staff.findMany({
      ...args,
      where: {
        ...args.where,
        ...notDeleted,
      },
      include: {
        ...staffInclude,
        ...args.include,
      },
    })
  },

  findById(id: string) {
    return prisma.staff.findFirst({
      where: { id, ...notDeleted },
      include: staffInclude,
    })
  },

  findByStaffCode(staffCode: string) {
    return prisma.staff.findFirst({
      where: { staffCode, ...notDeleted },
      include: staffInclude,
    })
  },

  create(data: Prisma.StaffCreateInput) {
    return prisma.staff.create({
      data,
      include: staffInclude,
    })
  },

  createMany(data: Prisma.StaffCreateManyInput[]) {
    return prisma.staff.createMany({ data, skipDuplicates: true })
  },

  update(id: string, data: Prisma.StaffUpdateInput) {
    return prisma.staff.update({
      where: { id },
      data,
      include: staffInclude,
    })
  },

  softDelete(id: string) {
    const deletedAt = new Date()

    return prisma.$transaction(async (tx) => {
      const current = await tx.staff.findFirst({
        where: { id, ...notDeleted },
      })

      if (!current) {
        return null
      }

      const staff = await tx.staff.update({
        where: { id },
        data: {
          deletedAt,
          staffCode: appendDeletedAt(current.staffCode, deletedAt),
        },
        include: staffInclude,
      })

      await tx.document.updateMany({
        where: { staffId: id, ...notDeleted },
        data: { deletedAt },
      })

      const user = await tx.user.findFirst({
        where: { staffId: id, ...notDeleted },
      })

      if (user) {
        await tx.user.update({
          where: { id: user.id },
          data: {
            deletedAt,
            email: appendDeletedAt(user.email, deletedAt),
          },
        })
      }

      return staff
    })
  },

  count(where?: Prisma.StaffWhereInput) {
    return prisma.staff.count({
      where: {
        ...where,
        ...notDeleted,
      },
    })
  },
}
