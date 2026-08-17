import type { Request, Response } from 'express'
import { departmentService } from '../services/department.service.js'

export const departmentController = {
  async list(_req: Request, res: Response) {
    const departments = await departmentService.list()
    res.status(200).json({ data: departments })
  },

  async tree(_req: Request, res: Response) {
    const tree = await departmentService.tree()
    res.status(200).json({ data: tree })
  },
}
