import type { ZodType } from 'zod'
import { Router } from 'express'
import { certificationController } from '../controllers/certification.controller.js'
import { educationController } from '../controllers/education.controller.js'
import { emergencyContactController } from '../controllers/emergency-contact.controller.js'
import { familyMemberController } from '../controllers/family-member.controller.js'
import { nextOfKinController } from '../controllers/next-of-kin.controller.js'
import { serviceHistoryController } from '../controllers/service-history.controller.js'
import { requirePermission } from '../middleware/require-permission.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/async-handler.js'
import type { AsyncHandler } from '../utils/async-handler.js'
import {
  createCertificationSchema,
  createEducationSchema,
  createEmergencyContactSchema,
  createFamilyMemberSchema,
  createNextOfKinSchema,
  createServiceHistorySchema,
  updateCertificationSchema,
  updateEducationSchema,
  updateEmergencyContactSchema,
  updateFamilyMemberSchema,
  updateNextOfKinSchema,
  updateServiceHistorySchema,
} from '../validators/staff-records.schema.js'

function childRoutes(
  list: AsyncHandler,
  create: AsyncHandler,
  update: AsyncHandler,
  remove: AsyncHandler,
  createSchema: ZodType,
  updateSchema: ZodType,
) {
  const router = Router({ mergeParams: true })
  router.get('/', requirePermission('DIRECTORY', 'view'), asyncHandler(list))
  router.post('/', requirePermission('DIRECTORY', 'edit'), validate(createSchema), asyncHandler(create))
  router.patch('/:id', requirePermission('DIRECTORY', 'edit'), validate(updateSchema), asyncHandler(update))
  router.delete('/:id', requirePermission('DIRECTORY', 'delete'), asyncHandler(remove))
  return router
}

export const educationRoutes = childRoutes(
  educationController.list,
  educationController.create,
  educationController.update,
  educationController.remove,
  createEducationSchema,
  updateEducationSchema,
)

export const certificationRoutes = childRoutes(
  certificationController.list,
  certificationController.create,
  certificationController.update,
  certificationController.remove,
  createCertificationSchema,
  updateCertificationSchema,
)

export const familyMemberRoutes = childRoutes(
  familyMemberController.list,
  familyMemberController.create,
  familyMemberController.update,
  familyMemberController.remove,
  createFamilyMemberSchema,
  updateFamilyMemberSchema,
)

export const emergencyContactRoutes = childRoutes(
  emergencyContactController.list,
  emergencyContactController.create,
  emergencyContactController.update,
  emergencyContactController.remove,
  createEmergencyContactSchema,
  updateEmergencyContactSchema,
)

export const nextOfKinRoutes = childRoutes(
  nextOfKinController.list,
  nextOfKinController.create,
  nextOfKinController.update,
  nextOfKinController.remove,
  createNextOfKinSchema,
  updateNextOfKinSchema,
)

export const serviceHistoryRoutes = childRoutes(
  serviceHistoryController.list,
  serviceHistoryController.create,
  serviceHistoryController.update,
  serviceHistoryController.remove,
  createServiceHistorySchema,
  updateServiceHistorySchema,
)
