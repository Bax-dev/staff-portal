import { z } from 'zod'

export const updateSettingsSchema = z.object({
  organizationName: z.string().min(1).optional(),
  defaultExportFormat: z.enum(['CSV', 'XLSX']).optional(),
})
