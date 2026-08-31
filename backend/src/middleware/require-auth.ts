import type { NextFunction, Request, Response } from 'express'
import { requireActor } from '../utils/require-actor.js'

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  requireActor(req)
  next()
}
