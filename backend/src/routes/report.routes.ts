import { Router } from 'express'
import { reportController } from '../controllers/report.controller.js'
import { asyncHandler } from '../utils/async-handler.js'

export const reportRoutes = Router()

reportRoutes.get('/overview', asyncHandler(reportController.overview))
reportRoutes.get('/workforce', asyncHandler(reportController.workforce))
