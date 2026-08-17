import { Router } from 'express'
import { settingsController } from '../controllers/settings.controller.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/async-handler.js'
import { updateSettingsSchema } from '../validators/settings.schema.js'

export const settingsRoutes = Router()

settingsRoutes.get('/', asyncHandler(settingsController.get))
settingsRoutes.patch('/', validate(updateSettingsSchema), asyncHandler(settingsController.update))
