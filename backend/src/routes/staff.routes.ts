import { Router } from 'express'
import { staffController } from '../controllers/staff.controller.js'
import { requirePermission } from '../middleware/require-permission.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/async-handler.js'
import { bulkDeleteStaffSchema, createStaffSchema, importStaffSchema, staffListQuerySchema, updateStaffSchema } from '../validators/staff.schema.js'
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

staffRoutes.get('/', requirePermission('DIRECTORY', 'view'), validate(staffListQuerySchema, 'query'), asyncHandler(staffController.list))
staffRoutes.get('/:id', requirePermission('DIRECTORY', 'view'), asyncHandler(staffController.getById))
staffRoutes.post('/', requirePermission('DIRECTORY', 'edit'), validate(createStaffSchema), asyncHandler(staffController.create))
staffRoutes.post('/import', requirePermission('DIRECTORY', 'edit'), validate(importStaffSchema), asyncHandler(staffController.importMany))
staffRoutes.post('/bulk-delete', requirePermission('DIRECTORY', 'delete'), validate(bulkDeleteStaffSchema), asyncHandler(staffController.removeMany))
staffRoutes.patch('/:id', requirePermission('DIRECTORY', 'edit'), validate(updateStaffSchema), asyncHandler(staffController.update))
staffRoutes.post('/:id/archive', requirePermission('ARCHIVE', 'edit'), asyncHandler(staffController.archive))
staffRoutes.post('/:id/unarchive', requirePermission('ARCHIVE', 'edit'), asyncHandler(staffController.unarchive))
staffRoutes.delete('/:id', requirePermission('DIRECTORY', 'delete'), asyncHandler(staffController.remove))
