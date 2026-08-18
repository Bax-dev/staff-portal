import type { Request, Response } from 'express'
import { notificationService } from '../services/notification.service.js'
import type { CreateNotificationInput, NotificationListQuery } from '../types/notification.js'
import { paramId } from '../utils/params.js'

export const notificationController = {
  async list(req: Request, res: Response) {
    const notifications = await notificationService.list(req.query as NotificationListQuery)
    res.status(200).json({ data: notifications })
  },

  async create(req: Request, res: Response) {
    const notification = await notificationService.create(req.body as CreateNotificationInput)
    res.status(201).json({ data: notification })
  },

  async markRead(req: Request, res: Response) {
    const notification = await notificationService.markRead(paramId(req, 'id'))
    res.status(200).json({ data: notification })
  },

  async remove(req: Request, res: Response) {
    await notificationService.remove(paramId(req, 'id'))
    res.status(204).send()
  },
}
