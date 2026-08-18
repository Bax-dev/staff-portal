import { z } from 'zod'

export const auditListQuerySchema = z.object({
  query: z.string().optional(),
  action: z.enum(['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'IMPORT', 'ARCHIVE', 'UNARCHIVE']).optional(),
  entityType: z.string().optional(),
})
