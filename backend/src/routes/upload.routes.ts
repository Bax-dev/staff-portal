import { Router } from 'express'
import { uploadController } from '../controllers/upload.controller.js'
import { requireAuth } from '../middleware/require-auth.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/async-handler.js'
import { presignDownloadSchema, presignUploadSchema } from '../validators/upload.schema.js'

export const uploadRoutes = Router()

uploadRoutes.post('/presign', requireAuth, validate(presignUploadSchema), asyncHandler(uploadController.presignUpload))
uploadRoutes.post('/download-url', requireAuth, validate(presignDownloadSchema), asyncHandler(uploadController.presignDownload))
