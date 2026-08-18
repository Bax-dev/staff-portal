import { Router } from 'express'
import { staffController } from '../controllers/staff.controller.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/async-handler.js'
import { createStaffSchema, importStaffSchema, staffListQuerySchema, updateStaffSchema } from '../validators/staff.schema.js'
import {
  certificationRoutes,
  educationRoutes,
  emergencyContactRoutes,
  familyMemberRoutes,
  nextOfKinRoutes,
  serviceHistoryRoutes,
} from './staff-records.routes.js'

export const staffRoutes = Router()

staffRoutes.use('/:staffId/education', educationRoutes)
staffRoutes.use('/:staffId/certifications', certificationRoutes)
staffRoutes.use('/:staffId/family', familyMemberRoutes)
staffRoutes.use('/:staffId/emergency-contacts', emergencyContactRoutes)
staffRoutes.use('/:staffId/next-of-kin', nextOfKinRoutes)
staffRoutes.use('/:staffId/service-history', serviceHistoryRoutes)

staffRoutes.get('/', validate(staffListQuerySchema, 'query'), asyncHandler(staffController.list))
staffRoutes.get('/:id', asyncHandler(staffController.getById))
staffRoutes.post('/', validate(createStaffSchema), asyncHandler(staffController.create))
staffRoutes.post('/import', validate(importStaffSchema), asyncHandler(staffController.importMany))
staffRoutes.patch('/:id', validate(updateStaffSchema), asyncHandler(staffController.update))
staffRoutes.post('/:id/archive', asyncHandler(staffController.archive))
staffRoutes.post('/:id/unarchive', asyncHandler(staffController.unarchive))
staffRoutes.delete('/:id', asyncHandler(staffController.remove))
