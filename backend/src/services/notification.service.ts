import { notificationModel } from '../models/notification.model.js'
import { userModel } from '../models/user.model.js'
import type { CreateNotificationInput, NotificationListQuery } from '../types/notification.js'
import { AppError } from '../utils/errors.js'

export const notificationService = {
  async list({ userId, unreadOnly }: NotificationListQuery) {
    const user = await userModel.findById(userId)
    if (!user) {
      throw new AppError(404, 'User not found')
    }

    return notificationModel.findMany({
      where: {
        userId,
        ...(unreadOnly === 'true' ? { readAt: null } : {}),
      },
    })
  },

  async create(input: CreateNotificationInput) {
    const user = await userModel.findById(input.userId)
    if (!user) {
      throw new AppError(404, 'User not found')
    }

    return notificationModel.create({
      title: input.title,
      body: input.body,
      user: { connect: { id: input.userId } },
    })
  },

  async markRead(id: string) {
    const notification = await notificationModel.findById(id)
    if (!notification) {
      throw new AppError(404, 'Notification not found')
    }

    return notificationModel.update(id, { readAt: notification.readAt ?? new Date() })
  },

  async remove(id: string) {
    const notification = await notificationModel.findById(id)
    if (!notification) {
      throw new AppError(404, 'Notification not found')
    }
    await notificationModel.softDelete(id)
  },
}
