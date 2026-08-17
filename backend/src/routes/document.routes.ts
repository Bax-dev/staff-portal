import { Router } from 'express'
import { documentController } from '../controllers/document.controller.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/async-handler.js'
import { createDocumentSchema, documentListQuerySchema } from '../validators/document.schema.js'

export const documentRoutes = Router()

documentRoutes.get('/', validate(documentListQuerySchema, 'query'), asyncHandler(documentController.list))
documentRoutes.post('/', validate(createDocumentSchema), asyncHandler(documentController.create))
documentRoutes.delete('/:id', asyncHandler(documentController.remove))
