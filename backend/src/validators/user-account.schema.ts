import { z } from 'zod'

const screenEnum = z.enum([
  'OVERVIEW',
  'DIRECTORY',
  'ARCHIVE',
  'ORGANIZATION',
  'DOCUMENTS',
  'REPORTS',
  'AUDIT_LOG',
  'SETTINGS',
])

export const createUserAccountSchema = z.object({
  staffId: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).optional(),
})

export const updatePermissionsSchema = z.object({
  permissions: z
    .array(
      z.object({
        screen: screenEnum,
        canView: z.boolean(),
        canEdit: z.boolean(),
        canDelete: z.boolean(),
      }),
    )
    .min(1),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8).optional(),
})
