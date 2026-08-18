import type { Request, Response } from 'express'
import { serviceHistoryService } from '../services/service-history.service.js'
import type { CreateServiceHistoryInput, UpdateServiceHistoryInput } from '../types/staff-records.js'
import { paramId } from '../utils/params.js'

export const serviceHistoryController = {
  async listAll(_req: Request, res: Response) {
    const records = await serviceHistoryService.listAll()
    res.status(200).json({ data: records })
  },

  async list(req: Request, res: Response) {
    const records = await serviceHistoryService.list(paramId(req, 'staffId'))
    res.status(200).json({ data: records })
  },

  async create(req: Request, res: Response) {
    const record = await serviceHistoryService.create(paramId(req, 'staffId'), req.body as CreateServiceHistoryInput)
    res.status(201).json({ data: record })
  },

  async update(req: Request, res: Response) {
    const record = await serviceHistoryService.update(
      paramId(req, 'staffId'),
      paramId(req, 'id'),
      req.body as UpdateServiceHistoryInput,
    )
    res.status(200).json({ data: record })
  },

  async remove(req: Request, res: Response) {
    await serviceHistoryService.remove(paramId(req, 'staffId'), paramId(req, 'id'))
    res.status(204).send()
  },
}
