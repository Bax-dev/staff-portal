import type { Screen } from '@prisma/client'
import { prisma } from '../config/database.js'

export type PermissionEntry = {
  screen: Screen
  canView: boolean
  canEdit: boolean
  canDelete: boolean
}

export const userPermissionModel = {
  findByUserId(userId: string) {
    return prisma.userPermission.findMany({
      where: { userId },
      orderBy: { screen: 'asc' },
    })
  },

  upsertMany(userId: string, entries: PermissionEntry[]) {
    return prisma.$transaction(
      entries.map((entry) =>
        prisma.userPermission.upsert({
          where: { userId_screen: { userId, screen: entry.screen } },
          update: {
            canView: entry.canView,
            canEdit: entry.canEdit,
            canDelete: entry.canDelete,
          },
          create: {
            userId,
            screen: entry.screen,
            canView: entry.canView,
            canEdit: entry.canEdit,
            canDelete: entry.canDelete,
          },
        }),
      ),
    )
  },
}
