import type { Prisma } from '@prisma/client'
import { prisma } from '../config/database.js'

export const departmentModel = {
  findAll() {
    return prisma.department.findMany({
      include: { children: true },
      orderBy: { name: 'asc' },
    })
  },

  findByName(name: string) {
    return prisma.department.findUnique({ where: { name } })
  },

  findById(id: string) {
    return prisma.department.findUnique({
      where: { id },
      include: { children: true, parent: true },
    })
  },

  create(data: Prisma.DepartmentCreateInput) {
    return prisma.department.create({ data })
  },

  count() {
    return prisma.department.count()
  },
}
