import type { User, UserRole } from '@prisma/client'
import type { AuthUser, FrontendRole } from '../types/auth.js'
import { AppError } from '../utils/errors.js'

const roleByFrontend = {
  admin: 'ADMINISTRATOR',
  staff: 'OFFICER',
} as const satisfies Record<FrontendRole, UserRole>

const frontendRoleByUser = {
  ADMINISTRATOR: 'admin',
  OFFICER: 'staff',
} as const satisfies Record<UserRole, FrontendRole>

export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: frontendRoleByUser[user.role],
    staffId: user.staffId,
  }
}

export function parseFrontendRole(role: FrontendRole) {
  const parsed = roleByFrontend[role]
  if (!parsed) {
    throw new AppError(400, `Invalid role: ${role}`)
  }
  return parsed
}
