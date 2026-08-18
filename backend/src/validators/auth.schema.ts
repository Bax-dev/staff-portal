import { z } from 'zod'

const frontendRole = z.enum(['admin', 'staff'])

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: frontendRole,
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

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  photo: z.string().min(1).nullable().optional(),
  theme: z.enum(['light', 'dark']).optional(),
  fontSize: z.enum(['small', 'medium', 'large', 'xlarge']).optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})
