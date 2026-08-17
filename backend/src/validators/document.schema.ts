import { z } from 'zod'

export const createDocumentSchema = z.object({
  staffId: z.string().uuid().optional(),
  category: z.enum(['STAFF_REGISTER', 'IDENTITY', 'SERVICE_HISTORY']),
  title: z.string().min(1),
  fileName: z.string().min(1),
  fileUrl: z.string().min(1),
  mimeType: z.string().min(1),
})

export const documentListQuerySchema = z.object({
  category: z.enum(['STAFF_REGISTER', 'IDENTITY', 'SERVICE_HISTORY']).optional(),
  staffId: z.string().uuid().optional(),
})
