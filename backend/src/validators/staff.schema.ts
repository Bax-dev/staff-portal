import { z } from 'zod'

const staffStatus = z.enum(['Active', 'On leave', 'Probation'])

function toText(value: unknown) {
  if (value == null) return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (typeof value === 'boolean') return String(value)
  if (typeof value === 'string') return value.trim()
  return value
}

const requiredText = z.preprocess(toText, z.string().min(1))
const optionalText = z.preprocess((value) => {
  const text = toText(value)
  return text === '' ? undefined : text
}, z.string().optional())
const optionalEmail = z.preprocess((value) => {
  const text = toText(value)
  return text === '' ? '' : text
}, z.union([z.string().email(), z.literal('')]).optional())

export const staffListQuerySchema = z.object({
  query: z.string().optional(),
  department: z.string().optional(),
  archived: z
    .enum(['true', 'false', '1', '0'])
    .optional()
    .transform((value) => (value == null ? undefined : value === 'true' || value === '1')),
})

export const createStaffSchema = z.object({
  name: requiredText,
  title: optionalText,
  staffId: requiredText,
  designation: requiredText,
  department: requiredText,
  email: optionalEmail,
  phone: optionalText,
  gender: optionalText,
  status: staffStatus.optional(),
  grade: optionalText,
  cadre: optionalText,
  appointmentDate: optionalText,
  location: optionalText,
  nationality: optionalText,
  dob: optionalText,
  maritalStatus: optionalText,
  nin: optionalText,
  tin: optionalText,
  pensionPin: optionalText,
  bankName: optionalText,
  accountNumber: optionalText,
  bvn: optionalText,
  ippis: optionalText,
  pfa: optionalText,
  bloodGroup: optionalText,
  genotype: optionalText,
  medicalFitness: optionalText,
  photo: optionalText,
})

export const updateStaffSchema = createStaffSchema.partial()

export const importStaffSchema = z.object({
  rows: z.array(createStaffSchema).min(1),
})
