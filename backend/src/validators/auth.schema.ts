import { z } from 'zod'

const frontendRole = z.enum(['admin', 'staff'])

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: frontendRole,
  rememberMe: z.boolean().optional(),
})

export const requestOtpSchema = z.object({
  email: z.string().email(),
})

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(8),
})

export const requestPasswordResetSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
})
