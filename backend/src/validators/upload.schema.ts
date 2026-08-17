import { z } from 'zod'

export const presignUploadSchema = z.object({
  kind: z.enum(['photo', 'document']),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  staffId: z.string().uuid().optional(),
  category: z.enum(['STAFF_REGISTER', 'IDENTITY', 'SERVICE_HISTORY']).optional(),
})

export const presignDownloadSchema = z.object({
  key: z.string().min(1),
})
