import type { Request } from 'express'

export function paramId(req: Request, name: string) {
  return String(req.params[name])
}
