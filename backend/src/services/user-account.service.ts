import { randomBytes } from 'node:crypto'
import { Screen } from '@prisma/client'
import { prisma } from '../config/database.js'
import { staffModel } from '../models/staff.model.js'
import { userModel } from '../models/user.model.js'
import { userPermissionModel, type PermissionEntry } from '../models/user-permission.model.js'
import { AppError } from '../utils/errors.js'
import { hashPassword } from '../utils/password.js'
import { toUserAccountDto } from './user-account.mapper.js'

const ALL_SCREENS = Object.values(Screen)

function generatePassword() {
  return randomBytes(9).toString('base64url')
}

async function requireAccount(userId: string) {
  const user = await userModel.findAccountById(userId)
  if (!user) {
    throw new AppError(404, 'User account not found')
  }
  return user
}

export const userAccountService = {
  async list() {
    const users = await userModel.listAccounts()
    return users.map((user) => toUserAccountDto(user, user.permissions))
  },

  async getById(id: string) {
    const user = await requireAccount(id)
    return toUserAccountDto(user, user.permissions)
  },

  async create(input: { staffId: string; email: string; password?: string }) {
    const staff = await staffModel.findById(input.staffId)
    if (!staff) {
      throw new AppError(404, 'Staff record not found')
    }

    const existingForStaff = await userModel.findByStaffId(input.staffId)
    if (existingForStaff) {
      throw new AppError(409, 'This staff member already has a login account')
    }

    const email = input.email.toLowerCase()
    const existingForEmail = await userModel.findByEmailAny(email)
    if (existingForEmail) {
      throw new AppError(409, 'This email is already in use by another account')
    }

    const plainPassword = input.password ?? generatePassword()
    const passwordHash = await hashPassword(plainPassword)

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          name: staff.name,
          passwordHash,
          role: 'OFFICER',
          staffId: staff.id,
        },
      })

      await tx.userPermission.createMany({
        data: ALL_SCREENS.map((screen) => ({
          userId: created.id,
          screen,
          canView: false,
          canEdit: false,
          canDelete: false,
        })),
      })

      return created
    })

    const account = await requireAccount(user.id)
    return { account: toUserAccountDto(account, account.permissions), plainPassword }
  },

  async updatePermissions(userId: string, entries: PermissionEntry[]) {
    await requireAccount(userId)
    await userPermissionModel.upsertMany(userId, entries)
    const account = await requireAccount(userId)
    return toUserAccountDto(account, account.permissions)
  },

  async resetPassword(userId: string, explicitPassword?: string) {
    const user = await requireAccount(userId)

    const plainPassword = explicitPassword ?? generatePassword()
    const passwordHash = await hashPassword(plainPassword)
    await userModel.update(user.id, { passwordHash })

    const account = await requireAccount(userId)
    return { account: toUserAccountDto(account, account.permissions), plainPassword }
  },

  async deactivate(userId: string) {
    const user = await requireAccount(userId)
    if (user.deletedAt) {
      throw new AppError(409, 'This account is already deactivated')
    }
    await userModel.update(userId, { deletedAt: new Date() })
    const account = await requireAccount(userId)
    return toUserAccountDto(account, account.permissions)
  },

  async reactivate(userId: string) {
    const user = await requireAccount(userId)
    if (!user.deletedAt) {
      throw new AppError(409, 'This account is already active')
    }
    await userModel.update(userId, { deletedAt: null })
    const account = await requireAccount(userId)
    return toUserAccountDto(account, account.permissions)
  },

  // Soft delete only: sets deletedAt rather than hard-deleting the row, since
  // AuditLog.actorId references User with onDelete: SetNull — a hard delete
  // would silently blank out historical audit entries' actor. Deactivate and
  // remove are intentionally equivalent for now (both just toggle deletedAt);
  // they are kept as separate endpoints for a later phase that may give
  // "removed" a distinct meaning (e.g. hiding from the account list).
  async remove(userId: string) {
    await requireAccount(userId)
    await userModel.update(userId, { deletedAt: new Date() })
  },
}
