import type { Request, Response } from 'express'
import { reportService } from '../services/report.service.js'

export const reportController = {
  async overview(_req: Request, res: Response) {
    const overview = await reportService.overview()
    res.status(200).json({ data: overview })
  },

  async workforce(_req: Request, res: Response) {
    const report = await reportService.workforce()
    res.status(200).json({ data: report })
  },
}
