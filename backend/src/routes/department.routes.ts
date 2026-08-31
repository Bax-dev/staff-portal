import { Router } from 'express'
import { departmentController } from '../controllers/department.controller.js'
import { requirePermission } from '../middleware/require-permission.js'
import { asyncHandler } from '../utils/async-handler.js'

export const departmentRoutes = Router()

departmentRoutes.get('/', requirePermission('ORGANIZATION', 'view'), asyncHandler(departmentController.list))
departmentRoutes.get('/tree', requirePermission('ORGANIZATION', 'view'), asyncHandler(departmentController.tree))
