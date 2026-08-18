import { Router } from 'express'
import { notificationController } from '../controllers/notification.controller.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/async-handler.js'
import { createNotificationSchema, notificationListQuerySchema } from '../validators/notification.schema.js'

export const notificationRoutes = Router()

notificationRoutes.get('/', validate(notificationListQuerySchema, 'query'), asyncHandler(notificationController.list))
notificationRoutes.post('/', validate(createNotificationSchema), asyncHandler(notificationController.create))
notificationRoutes.patch('/:id/read', asyncHandler(notificationController.markRead))
notificationRoutes.delete('/:id', asyncHandler(notificationController.remove))
