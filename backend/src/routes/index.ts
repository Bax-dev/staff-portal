import { Router } from 'express'
import { auditRoutes } from './audit.routes.js'
import { authRoutes } from './auth.routes.js'
import { departmentRoutes } from './department.routes.js'
import { documentRoutes } from './document.routes.js'
import { notificationRoutes } from './notification.routes.js'
import { reportRoutes } from './report.routes.js'
import { settingsRoutes } from './settings.routes.js'
import { staffRoutes } from './staff.routes.js'
import { uploadRoutes } from './upload.routes.js'
import { userAccountRoutes } from './user-account.routes.js'
import { serviceHistoryController } from '../controllers/service-history.controller.js'
import { requirePermission } from '../middleware/require-permission.js'
import { asyncHandler } from '../utils/async-handler.js'

export const apiRouter = Router()

apiRouter.use('/auth', authRoutes)
apiRouter.use('/staff', staffRoutes)
apiRouter.use('/departments', departmentRoutes)
apiRouter.use('/documents', documentRoutes)
apiRouter.get('/service-history', requirePermission('DIRECTORY', 'view'), asyncHandler(serviceHistoryController.listAll))
apiRouter.use('/reports', reportRoutes)
apiRouter.use('/settings', settingsRoutes)
apiRouter.use('/uploads', uploadRoutes)
apiRouter.use('/notifications', notificationRoutes)
apiRouter.use('/audit-logs', auditRoutes)
apiRouter.use('/user-accounts', userAccountRoutes)
