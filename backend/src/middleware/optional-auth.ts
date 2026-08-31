import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { userModel } from '../models/user.model.js'
import type { RequestWithActor } from '../types/http.js'

type TokenPayload = {
  sub: string
  email: string
  role: string
}

function readToken(req: Request) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return null
  try {
    return jwt.verify(header.slice(7), env.jwtSecret) as TokenPayload
  } catch {
    return null
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const payload = readToken(req)
  if (!payload?.sub) {
    next()
    return
  }

  try {
    const user = await userModel.findById(payload.sub)
    if (user) {
      ;(req as RequestWithActor).actor = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    }
  } catch (error: unknown) {
    console.error('Failed to resolve request actor', error)
  }

  next()
}
