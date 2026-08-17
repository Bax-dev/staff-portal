import { Router } from 'express'
import { departmentController } from '../controllers/department.controller.js'
import { asyncHandler } from '../utils/async-handler.js'

export const departmentRoutes = Router()

departmentRoutes.get('/', asyncHandler(departmentController.list))
departmentRoutes.get('/tree', asyncHandler(departmentController.tree))
