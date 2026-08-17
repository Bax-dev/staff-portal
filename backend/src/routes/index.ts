import { Router } from 'express'
import { authRoutes } from './auth.routes.js'
import { departmentRoutes } from './department.routes.js'
import { documentRoutes } from './document.routes.js'
import { reportRoutes } from './report.routes.js'
import { settingsRoutes } from './settings.routes.js'
import { staffRoutes } from './staff.routes.js'
import { uploadRoutes } from './upload.routes.js'

export const apiRouter = Router()

apiRouter.use('/auth', authRoutes)
apiRouter.use('/staff', staffRoutes)
apiRouter.use('/departments', departmentRoutes)
apiRouter.use('/documents', documentRoutes)
apiRouter.use('/reports', reportRoutes)
apiRouter.use('/settings', settingsRoutes)
apiRouter.use('/uploads', uploadRoutes)
