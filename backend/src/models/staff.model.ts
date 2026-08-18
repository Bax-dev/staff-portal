import type { Prisma } from '@prisma/client'
import { prisma } from '../config/database.js'
import { appendDeletedAt } from '../utils/soft-delete.js'

const staffInclude = {
  department: true,
  documents: {
    where: { deletedAt: null },
  },
  serviceHistory: {
    where: { deletedAt: null },
  },
  nextOfKin: {
    where: { deletedAt: null },
  },
} satisfies Prisma.StaffInclude

const notDeleted = { deletedAt: null } as const

export const staffModel = {
  findMany(args: Prisma.StaffFindManyArgs, archived = false) {
    return prisma.staff.findMany({
      ...args,
      where: {
        ...args.where,
        ...notDeleted,
        archivedAt: archived ? { not: null } : null,
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

      await tx.education.updateMany({
        where: { staffId: id, ...notDeleted },
        data: { deletedAt },
      })

      await tx.certification.updateMany({
        where: { staffId: id, ...notDeleted },
        data: { deletedAt },
      })

      await tx.familyMember.updateMany({
        where: { staffId: id, ...notDeleted },
        data: { deletedAt },
      })

      await tx.emergencyContact.updateMany({
        where: { staffId: id, ...notDeleted },
        data: { deletedAt },
      })

      await tx.nextOfKin.updateMany({
        where: { staffId: id, ...notDeleted },
        data: { deletedAt },
      })

      await tx.serviceHistory.updateMany({
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

        await tx.notification.updateMany({
          where: { userId: user.id, ...notDeleted },
          data: { deletedAt },
        })
      }

      return staff
    })
  },

  count(where?: Prisma.StaffWhereInput, archived = false) {
    return prisma.staff.count({
      where: {
        ...where,
        ...notDeleted,
        archivedAt: archived ? { not: null } : null,
      },
    })
  },

  archive(id: string) {
    return prisma.staff.update({
      where: { id },
      data: { archivedAt: new Date() },
      include: staffInclude,
    })
  },

  unarchive(id: string) {
    return prisma.staff.update({
      where: { id },
      data: { archivedAt: null },
      include: staffInclude,
    })
  },
}
