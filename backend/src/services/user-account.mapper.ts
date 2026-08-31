import type { Staff, User, UserPermission } from '@prisma/client'

export type UserAccountDto = {
  id: string
  email: string
  name: string
  role: User['role']
  staffId: string | null
  staffName: string | null
  isActive: boolean
  permissions: Array<{
    screen: UserPermission['screen']
    canView: boolean
    canEdit: boolean
    canDelete: boolean
  }>
  createdAt: string
}

type UserWithStaff = User & { staff?: Pick<Staff, 'name' | 'designation'> | null }

export function toUserAccountDto(user: UserWithStaff, permissions: UserPermission[]): UserAccountDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    staffId: user.staffId,
    staffName: user.staff?.name ?? null,
    isActive: user.deletedAt == null,
    permissions: permissions.map((permission) => ({
      screen: permission.screen,
      canView: permission.canView,
      canEdit: permission.canEdit,
      canDelete: permission.canDelete,
    })),
    createdAt: user.createdAt.toISOString(),
  }
}
