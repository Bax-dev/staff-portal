import type { Request, Response } from 'express'
import { auditService } from '../services/audit.service.js'
import type { AuditListQuery } from '../types/audit.js'

export const auditController = {
  async list(req: Request, res: Response) {
    const logs = await auditService.list(req.query as AuditListQuery)
    res.status(200).json({ data: logs })
  },
}
