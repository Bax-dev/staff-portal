import { Router } from 'express'
import { authController } from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/require-auth.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/async-handler.js'
import {
  changePasswordSchema,
  loginSchema,
  requestOtpSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  updateProfileSchema,
  verifyOtpSchema,
} from '../validators/auth.schema.js'

export const authRoutes = Router()

// Pre-authentication routes stay completely open.
authRoutes.post('/login', validate(loginSchema), asyncHandler(authController.login))
authRoutes.post('/forgot-password', validate(requestPasswordResetSchema), asyncHandler(authController.requestPasswordReset))
authRoutes.post('/reset-password', validate(resetPasswordSchema), asyncHandler(authController.resetPassword))
authRoutes.post('/otp/request', validate(requestOtpSchema), asyncHandler(authController.requestOtp))
authRoutes.post('/otp/verify', validate(verifyOtpSchema), asyncHandler(authController.verifyOtp))

// These require a signed-in actor. (The controllers also call requireActor
// internally — harmless belt-and-suspenders left in place.)
authRoutes.get('/me', requireAuth, asyncHandler(authController.me))
authRoutes.patch('/me', requireAuth, validate(updateProfileSchema), asyncHandler(authController.updateProfile))
authRoutes.post('/change-password', requireAuth, validate(changePasswordSchema), asyncHandler(authController.changePassword))
