import type { UserRole } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../utils/errors.js'
import { requireActor } from '../utils/require-actor.js'

export function requireRole(role: UserRole) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const actor = requireActor(req)
    if (actor.role !== role) {
      throw new AppError(403, 'You do not have permission to perform this action.')
    }
    next()
  }
}
