import { z } from 'zod'

export const notificationListQuerySchema = z.object({
  userId: z.string().uuid(),
  unreadOnly: z.enum(['true', 'false']).optional(),
})

export const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1),
  body: z.string().min(1),
})
