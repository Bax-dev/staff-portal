import { Router } from 'express'
import { authController } from '../controllers/auth.controller.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/async-handler.js'
import {
  loginSchema,
  requestOtpSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from '../validators/auth.schema.js'

export const authRoutes = Router()

authRoutes.post('/login', validate(loginSchema), asyncHandler(authController.login))
authRoutes.post('/forgot-password', validate(requestPasswordResetSchema), asyncHandler(authController.requestPasswordReset))
authRoutes.post('/reset-password', validate(resetPasswordSchema), asyncHandler(authController.resetPassword))
authRoutes.post('/otp/request', validate(requestOtpSchema), asyncHandler(authController.requestOtp))
authRoutes.post('/otp/verify', validate(verifyOtpSchema), asyncHandler(authController.verifyOtp))
