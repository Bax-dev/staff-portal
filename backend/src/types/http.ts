import type { Request } from 'express'
import type { RequestActor } from './audit.js'

export type RequestWithActor = Request & {
  actor?: RequestActor
}
