import type { Request, Response } from 'express'
import { certificationService } from '../services/certification.service.js'
import type { CreateCertificationInput, UpdateCertificationInput } from '../types/staff-records.js'
import { paramId } from '../utils/params.js'

export const certificationController = {
  async list(req: Request, res: Response) {
    const records = await certificationService.list(paramId(req, 'staffId'))
    res.status(200).json({ data: records })
  },

  async create(req: Request, res: Response) {
    const record = await certificationService.create(paramId(req, 'staffId'), req.body as CreateCertificationInput)
    res.status(201).json({ data: record })
  },

  async update(req: Request, res: Response) {
    const record = await certificationService.update(
      paramId(req, 'staffId'),
      paramId(req, 'id'),
      req.body as UpdateCertificationInput,
    )
    res.status(200).json({ data: record })
  },

  async remove(req: Request, res: Response) {
    await certificationService.remove(paramId(req, 'staffId'), paramId(req, 'id'))
    res.status(204).send()
  },
}
