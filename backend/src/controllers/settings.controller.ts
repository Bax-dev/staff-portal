import type { Request, Response } from 'express'
import { settingsService } from '../services/settings.service.js'

export const settingsController = {
  async get(_req: Request, res: Response) {
    const settings = await settingsService.get()
    res.status(200).json({ data: settings })
  },

  async update(req: Request, res: Response) {
    const settings = await settingsService.update(
      req.body as { organizationName?: string; defaultExportFormat?: 'CSV' | 'XLSX' },
    )
    res.status(200).json({ data: settings })
  },
}
