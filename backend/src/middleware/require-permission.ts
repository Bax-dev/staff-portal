import type { Screen } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'
import { userPermissionModel } from '../models/user-permission.model.js'
import { asyncHandler } from '../utils/async-handler.js'
import { AppError } from '../utils/errors.js'
import { requireActor } from '../utils/require-actor.js'

type Capability = 'view' | 'edit' | 'delete'

export function requirePermission(screen: Screen, capability: Capability) {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const actor = requireActor(req)

    if (actor.role === 'ADMINISTRATOR') {
      next()
      return
    }

    const permissions = await userPermissionModel.findByUserId(actor.id)
    const permission = permissions.find((entry) => entry.screen === screen)
    const allowed =
      capability === 'view' ? permission?.canView : capability === 'edit' ? permission?.canEdit : permission?.canDelete

    if (!allowed) {
      throw new AppError(403, 'You do not have permission to perform this action.')
    }

    next()
  })
}
