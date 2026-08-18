import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { userModel } from '../models/user.model.js'
import type { LoginInput, RequestOtpInput, RequestPasswordResetInput, ResetPasswordInput, UpdateProfileInput, ChangePasswordInput, VerifyOtpInput } from '../types/auth.js'
import { AppError } from '../utils/errors.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { toAuthUser } from './auth.mapper.js'
import { otpService } from './otp.service.js'
import { passwordResetService } from './password-reset.service.js'

function signSession(userId: string, email: string, role: string) {
  return jwt.sign({ sub: userId, email, role }, env.jwtSecret, {
    expiresIn: '12h',
  })
}

export const authService = {
  async login({ email, password }: LoginInput) {
    const user = await userModel.findByEmail(email)

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new AppError(401, 'Invalid email or password.')
    }

    return {
      token: signSession(user.id, user.email, user.role),
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

  async getMe(userId: string) {
    const user = await userModel.findById(userId)
    if (!user) {
      throw new AppError(401, 'Sign in to continue.')
    }
    return toAuthUser(user)
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await userModel.findById(userId)
    if (!user) {
      throw new AppError(401, 'Sign in to continue.')
    }

    const updated = await userModel.update(user.id, {
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(input.photo !== undefined ? { photo: input.photo } : {}),
      ...(input.theme ? { theme: input.theme } : {}),
      ...(input.fontSize ? { fontSize: input.fontSize } : {}),
    })

    return toAuthUser(updated)
  },

  async changePassword(userId: string, { currentPassword, newPassword }: ChangePasswordInput) {
    const user = await userModel.findById(userId)
    if (!user) {
      throw new AppError(401, 'Sign in to continue.')
    }

    if (!(await verifyPassword(currentPassword, user.passwordHash))) {
      throw new AppError(400, 'Current password is incorrect.')
    }

    await userModel.update(user.id, { passwordHash: await hashPassword(newPassword) })
    return { updated: true }
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
