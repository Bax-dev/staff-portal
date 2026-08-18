import type { Request, Response } from 'express'
import { authService } from '../services/auth.service.js'
import type { ChangePasswordInput, LoginInput, RequestOtpInput, RequestPasswordResetInput, ResetPasswordInput, UpdateProfileInput, VerifyOtpInput } from '../types/auth.js'
import { requireActor } from '../utils/require-actor.js'

export const authController = {
  async login(req: Request, res: Response) {
    const result = await authService.login(req.body as LoginInput)
    res.status(200).json({ data: result })
  },

  async me(req: Request, res: Response) {
    const actor = requireActor(req)
    const user = await authService.getMe(actor.id)
    res.status(200).json({ data: user })
  },

  async updateProfile(req: Request, res: Response) {
    const actor = requireActor(req)
    const user = await authService.updateProfile(actor.id, req.body as UpdateProfileInput)
    res.status(200).json({ data: user })
  },

  async changePassword(req: Request, res: Response) {
    const actor = requireActor(req)
    const result = await authService.changePassword(actor.id, req.body as ChangePasswordInput)
    res.status(200).json({ data: result })
  },

  async requestPasswordReset(req: Request, res: Response) {
    const result = await authService.requestPasswordReset(req.body as RequestPasswordResetInput)
    res.status(200).json({ data: result })
  },

  async resetPassword(req: Request, res: Response) {
    await authService.resetPassword(req.body as ResetPasswordInput)
    res.status(200).json({ data: { reset: true } })
  },

  async requestOtp(req: Request, res: Response) {
    const result = await authService.requestOtp(req.body as RequestOtpInput)
    res.status(200).json({ data: result })
  },

  async verifyOtp(req: Request, res: Response) {
    const result = await authService.verifyOtp(req.body as VerifyOtpInput)
    res.status(200).json({ data: result })
  },
}
