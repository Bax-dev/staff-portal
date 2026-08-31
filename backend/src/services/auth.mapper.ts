import { Screen, type User, type UserRole } from '@prisma/client'
import type { AuthUser, FrontendRole } from '../types/auth.js'
import { userPermissionModel } from '../models/user-permission.model.js'
import { AppError } from '../utils/errors.js'

const roleByFrontend = {
  admin: 'ADMINISTRATOR',
  staff: 'OFFICER',
} as const satisfies Record<FrontendRole, UserRole>

const frontendRoleByUser = {
  ADMINISTRATOR: 'admin',
  OFFICER: 'staff',
} as const satisfies Record<UserRole, FrontendRole>

const ALL_SCREENS = Object.values(Screen)

export async function toAuthUser(user: User): Promise<AuthUser> {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: frontendRoleByUser[user.role],
    staffId: user.staffId,
    photo: user.photo,
    theme: user.theme === 'dark' ? 'dark' : 'light',
    fontSize: parseFontSize(user.fontSize),
    permissions: await resolvePermissions(user),
  }
}

// Admins bypass the permission table entirely per the enforcement design, so
// rather than querying the (likely-empty) UserPermission rows for them, we
// synthesize full access across every screen.
async function resolvePermissions(user: User): Promise<AuthUser['permissions']> {
  if (user.role === 'ADMINISTRATOR') {
    return ALL_SCREENS.map((screen) => ({ screen, canView: true, canEdit: true, canDelete: true }))
  }

  const permissions = await userPermissionModel.findByUserId(user.id)
  return permissions.map((permission) => ({
    screen: permission.screen,
    canView: permission.canView,
    canEdit: permission.canEdit,
    canDelete: permission.canDelete,
  }))
}

function parseFontSize(value: string): AuthUser['fontSize'] {
  if (value === 'small' || value === 'large' || value === 'xlarge') return value
  return 'medium'
}

export function parseFrontendRole(role: FrontendRole) {
  const parsed = roleByFrontend[role]
  if (!parsed) {
    throw new AppError(400, `Invalid role: ${role}`)
  }
  return parsed
}
