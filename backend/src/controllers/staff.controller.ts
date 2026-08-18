import type { Request, Response } from 'express'
import { staffService } from '../services/staff.service.js'
import type { CreateStaffInput, StaffListQuery, UpdateStaffInput } from '../types/staff.js'

export const staffController = {
  async list(req: Request, res: Response) {
    const staff = await staffService.list(req.query as StaffListQuery)
    res.status(200).json({ data: staff })
  },

  async getById(req: Request, res: Response) {
    const staff = await staffService.getById(String(req.params.id))
    res.status(200).json({ data: staff })
  },

  async create(req: Request, res: Response) {
    const staff = await staffService.create(req.body as CreateStaffInput)
    res.status(201).json({ data: staff })
  },

  async update(req: Request, res: Response) {
    const staff = await staffService.update(String(req.params.id), req.body as UpdateStaffInput)
    res.status(200).json({ data: staff })
  },

  async remove(req: Request, res: Response) {
    await staffService.remove(String(req.params.id))
    res.status(204).send()
  },

  async archive(req: Request, res: Response) {
    const staff = await staffService.archive(String(req.params.id))
    res.status(200).json({ data: staff })
  },

  async unarchive(req: Request, res: Response) {
    const staff = await staffService.unarchive(String(req.params.id))
    res.status(200).json({ data: staff })
  },

  async importMany(req: Request, res: Response) {
    const body = req.body as { rows: CreateStaffInput[] }
    const staff = await staffService.importMany(body.rows)
    res.status(201).json({ data: staff })
  },
}
