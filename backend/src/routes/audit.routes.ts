import { Router } from 'express'
import { auditController } from '../controllers/audit.controller.js'
import { requirePermission } from '../middleware/require-permission.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/async-handler.js'
import { auditListQuerySchema } from '../validators/audit.schema.js'

export const auditRoutes = Router()

auditRoutes.get('/', requirePermission('AUDIT_LOG', 'view'), validate(auditListQuerySchema, 'query'), asyncHandler(auditController.list))
