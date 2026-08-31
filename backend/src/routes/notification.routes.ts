import { Router } from 'express'
import { notificationController } from '../controllers/notification.controller.js'
import { requireAuth } from '../middleware/require-auth.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/async-handler.js'
import { createNotificationSchema, notificationListQuerySchema } from '../validators/notification.schema.js'

export const notificationRoutes = Router()

notificationRoutes.get('/', requireAuth, validate(notificationListQuerySchema, 'query'), asyncHandler(notificationController.list))
notificationRoutes.post('/', requireAuth, validate(createNotificationSchema), asyncHandler(notificationController.create))
notificationRoutes.patch('/:id/read', requireAuth, asyncHandler(notificationController.markRead))
notificationRoutes.delete('/:id', requireAuth, asyncHandler(notificationController.remove))
