import { Router } from 'express'
import { documentController } from '../controllers/document.controller.js'
import { requirePermission } from '../middleware/require-permission.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/async-handler.js'
import { createDocumentSchema, documentListQuerySchema } from '../validators/document.schema.js'

export const documentRoutes = Router()

documentRoutes.get('/', requirePermission('DOCUMENTS', 'view'), validate(documentListQuerySchema, 'query'), asyncHandler(documentController.list))
documentRoutes.post('/', requirePermission('DOCUMENTS', 'edit'), validate(createDocumentSchema), asyncHandler(documentController.create))
documentRoutes.delete('/:id', requirePermission('DOCUMENTS', 'delete'), asyncHandler(documentController.remove))
