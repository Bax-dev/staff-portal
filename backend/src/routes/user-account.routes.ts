import { Router } from 'express'
import { userAccountController } from '../controllers/user-account.controller.js'
import { requireRole } from '../middleware/require-role.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/async-handler.js'
import {
  createUserAccountSchema,
  resetPasswordSchema,
  updatePermissionsSchema,
} from '../validators/user-account.schema.js'

// This entire resource is admin-only: gate the whole router at once rather
// than per-route.
export const userAccountRoutes = Router()

userAccountRoutes.use(requireRole('ADMINISTRATOR'))

userAccountRoutes.get('/', asyncHandler(userAccountController.list))
userAccountRoutes.get('/:id', asyncHandler(userAccountController.getById))
userAccountRoutes.post('/', validate(createUserAccountSchema), asyncHandler(userAccountController.create))
userAccountRoutes.patch(
  '/:id/permissions',
  validate(updatePermissionsSchema),
  asyncHandler(userAccountController.updatePermissions),
)
userAccountRoutes.post(
  '/:id/reset-password',
  validate(resetPasswordSchema),
  asyncHandler(userAccountController.resetPassword),
)
userAccountRoutes.post('/:id/deactivate', asyncHandler(userAccountController.deactivate))
userAccountRoutes.post('/:id/reactivate', asyncHandler(userAccountController.reactivate))
userAccountRoutes.delete('/:id', asyncHandler(userAccountController.remove))
