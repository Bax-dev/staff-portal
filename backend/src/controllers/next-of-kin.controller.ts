import type { Request, Response } from 'express'
import { nextOfKinService } from '../services/next-of-kin.service.js'
import type { CreateNextOfKinInput, UpdateNextOfKinInput } from '../types/staff-records.js'
import { paramId } from '../utils/params.js'

export const nextOfKinController = {
  async list(req: Request, res: Response) {
    const records = await nextOfKinService.list(paramId(req, 'staffId'))
    res.status(200).json({ data: records })
  },

  async create(req: Request, res: Response) {
    const record = await nextOfKinService.create(paramId(req, 'staffId'), req.body as CreateNextOfKinInput)
    res.status(201).json({ data: record })
  },

  async update(req: Request, res: Response) {
    const record = await nextOfKinService.update(
      paramId(req, 'staffId'),
      paramId(req, 'id'),
      req.body as UpdateNextOfKinInput,
    )
    res.status(200).json({ data: record })
  },

  async remove(req: Request, res: Response) {
    await nextOfKinService.remove(paramId(req, 'staffId'), paramId(req, 'id'))
    res.status(204).send()
  },
}
