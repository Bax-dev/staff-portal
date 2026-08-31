import { Router } from 'express'
import { reportController } from '../controllers/report.controller.js'
import { requirePermission } from '../middleware/require-permission.js'
import { asyncHandler } from '../utils/async-handler.js'

export const reportRoutes = Router()

reportRoutes.get('/overview', requirePermission('OVERVIEW', 'view'), asyncHandler(reportController.overview))
reportRoutes.get('/workforce', requirePermission('REPORTS', 'view'), asyncHandler(reportController.workforce))
