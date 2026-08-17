import { Router } from 'express'
import { staffController } from '../controllers/staff.controller.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/async-handler.js'
import { createStaffSchema, importStaffSchema, staffListQuerySchema, updateStaffSchema } from '../validators/staff.schema.js'

export const staffRoutes = Router()

staffRoutes.get('/', validate(staffListQuerySchema, 'query'), asyncHandler(staffController.list))
staffRoutes.get('/:id', asyncHandler(staffController.getById))
staffRoutes.post('/', validate(createStaffSchema), asyncHandler(staffController.create))
staffRoutes.post('/import', validate(importStaffSchema), asyncHandler(staffController.importMany))
staffRoutes.patch('/:id', validate(updateStaffSchema), asyncHandler(staffController.update))
staffRoutes.delete('/:id', asyncHandler(staffController.remove))
