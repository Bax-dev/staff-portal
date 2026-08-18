import type { Request } from 'express'
import type { RequestWithActor } from '../types/http.js'
import { AppError } from './errors.js'

export function requireActor(req: Request) {
  const actor = (req as RequestWithActor).actor
  if (!actor?.id) {
    throw new AppError(401, 'Sign in to continue.')
  }
  return actor
}
