import type { NextFunction, Request, Response } from 'express'
import { auditService } from '../services/audit.service.js'
import type { RequestWithActor } from '../types/http.js'
import { bodyEmail, describeAuditRequest, extractEntityId, requestPath } from '../utils/audit-request.js'

export function auditLogger(req: Request, res: Response, next: NextFunction) {
  const described = describeAuditRequest(req)
  if (!described) {
    next()
    return
  }

  let responseId: string | null = null
  const originalJson = res.json.bind(res)
  res.json = ((body: unknown) => {
    responseId = extractEntityId(body)
    return originalJson(body)
  }) as typeof res.json

  res.on('finish', () => {
    if (res.statusCode >= 400) return

    void auditService
      .record({
        ...described,
        entityId: described.entityId ?? responseId,
        actor: (req as RequestWithActor).actor,
        actorEmail: bodyEmail(req.body) ?? undefined,
        metadata: {
          method: req.method,
          path: requestPath(req),
        },
      })
      .catch((error: unknown) => {
        console.error('Failed to write audit log', error)
      })
  })

  next()
}
