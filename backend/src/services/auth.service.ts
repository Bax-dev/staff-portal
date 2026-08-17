import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { userModel } from '../models/user.model.js'
import type { LoginInput, RequestOtpInput, RequestPasswordResetInput, ResetPasswordInput, VerifyOtpInput } from '../types/auth.js'
import { AppError } from '../utils/errors.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { parseFrontendRole, toAuthUser } from './auth.mapper.js'
import { otpService } from './otp.service.js'
import { passwordResetService } from './password-reset.service.js'

function signSession(userId: string, email: string, role: string, rememberMe?: boolean) {
  return jwt.sign({ sub: userId, email, role }, env.jwtSecret, {
    expiresIn: rememberMe ? '30d' : '12h',
  })
}

export const authService = {
  async login({ email, password, role, rememberMe }: LoginInput) {
    const user = await userModel.findByEmail(email)
    const expectedRole = parseFrontendRole(role)

    if (!user || user.role !== expectedRole || !(await verifyPassword(password, user.passwordHash))) {
      throw new AppError(401, 'Invalid email, password or role.')
    }

    return {
      token: signSession(user.id, user.email, user.role, rememberMe),
      user: toAuthUser(user),
    }
  },

  async requestPasswordReset({ email }: RequestPasswordResetInput) {
    const user = await userModel.findByEmail(email)
    if (!user) {
      return { email, expiresInSeconds: env.passwordResetTtlSeconds }
    }

    const reset = await passwordResetService.issue(user.id)

    if (env.nodeEnv !== 'production') {
      console.info(`[password-reset] ${email} -> ${reset.token}`)
    }

    return {
      email,
      expiresInSeconds: reset.expiresInSeconds,
    }
  },

  async resetPassword({ token, password }: ResetPasswordInput) {
    const userId = await passwordResetService.consume(token)
    const user = await userModel.findById(userId)
    if (!user) {
      throw new AppError(400, 'This reset link is invalid or has expired.')
    }

    await userModel.update(user.id, { passwordHash: await hashPassword(password) })
  },

  async requestOtp({ email }: RequestOtpInput) {
    const user = await userModel.findByEmail(email)
    if (!user) {
      throw new AppError(404, 'No account found for this email')
    }

    const otp = await otpService.issue(email)

    if (env.nodeEnv !== 'production') {
      console.info(`[otp] ${email} -> ${otp.code}`)
    }

    return {
      email: user.email,
      expiresInSeconds: otp.expiresInSeconds,
    }
  },

  async verifyOtp({ email, code }: VerifyOtpInput) {
    const user = await userModel.findByEmail(email)
    if (!user) {
      throw new AppError(404, 'No account found for this email')
    }

    await otpService.verify(email, code)

    return {
      token: signSession(user.id, user.email, user.role),
      user: toAuthUser(user),
    }
  },
}
