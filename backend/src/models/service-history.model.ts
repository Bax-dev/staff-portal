import type { Prisma } from '@prisma/client'
import { prisma } from '../config/database.js'

export const serviceHistoryModel = {
  findByStaffId(staffId: string) {
    return prisma.serviceHistory.findMany({
      where: { staffId },
      orderBy: { effectiveDate: 'desc' },
    })
  },

  create(data: Prisma.ServiceHistoryCreateInput) {
    return prisma.serviceHistory.create({ data })
  },
}
