import type { Request, Response } from 'express'
import { emergencyContactService } from '../services/emergency-contact.service.js'
import type { CreateEmergencyContactInput, UpdateEmergencyContactInput } from '../types/staff-records.js'
import { paramId } from '../utils/params.js'

export const emergencyContactController = {
  async list(req: Request, res: Response) {
    const records = await emergencyContactService.list(paramId(req, 'staffId'))
    res.status(200).json({ data: records })
  },

  async create(req: Request, res: Response) {
    const record = await emergencyContactService.create(
      paramId(req, 'staffId'),
      req.body as CreateEmergencyContactInput,
    )
    res.status(201).json({ data: record })
  },

  async update(req: Request, res: Response) {
    const record = await emergencyContactService.update(
      paramId(req, 'staffId'),
      paramId(req, 'id'),
      req.body as UpdateEmergencyContactInput,
    )
    res.status(200).json({ data: record })
  },

  async remove(req: Request, res: Response) {
    await emergencyContactService.remove(paramId(req, 'staffId'), paramId(req, 'id'))
    res.status(204).send()
  },
}
