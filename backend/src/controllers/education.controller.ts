import type { Request, Response } from 'express'
import { educationService } from '../services/education.service.js'
import type { CreateEducationInput, UpdateEducationInput } from '../types/staff-records.js'
import { paramId } from '../utils/params.js'

export const educationController = {
  async list(req: Request, res: Response) {
    const records = await educationService.list(paramId(req, 'staffId'))
    res.status(200).json({ data: records })
  },

  async create(req: Request, res: Response) {
    const record = await educationService.create(paramId(req, 'staffId'), req.body as CreateEducationInput)
    res.status(201).json({ data: record })
  },

  async update(req: Request, res: Response) {
    const record = await educationService.update(
      paramId(req, 'staffId'),
      paramId(req, 'id'),
      req.body as UpdateEducationInput,
    )
    res.status(200).json({ data: record })
  },

  async remove(req: Request, res: Response) {
    await educationService.remove(paramId(req, 'staffId'), paramId(req, 'id'))
    res.status(204).send()
  },
}
