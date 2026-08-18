import { z } from 'zod'

const optionalDate = z.string().min(1).optional()

export const createEducationSchema = z.object({
  institution: z.string().min(1),
  qualification: z.string().min(1),
  fieldOfStudy: z.string().optional(),
  startDate: optionalDate,
  endDate: optionalDate,
})

export const updateEducationSchema = createEducationSchema.partial()

export const createCertificationSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  issuedDate: optionalDate,
  expiryDate: optionalDate,
  certificateNumber: z.string().optional(),
})

export const updateCertificationSchema = createCertificationSchema.partial()

export const createFamilyMemberSchema = z.object({
  name: z.string().min(1),
  relationship: z.string().min(1),
  dateOfBirth: optionalDate,
  gender: z.string().optional(),
  phone: z.string().optional(),
})

export const updateFamilyMemberSchema = createFamilyMemberSchema.partial()

export const createEmergencyContactSchema = z.object({
  name: z.string().min(1),
  relationship: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
})

export const updateEmergencyContactSchema = createEmergencyContactSchema.partial()

export const createNextOfKinSchema = z.object({
  name: z.string().min(1),
  relationship: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().optional(),
})

export const updateNextOfKinSchema = createNextOfKinSchema.partial()

export const createServiceHistorySchema = z.object({
  type: z.enum(['PROMOTION', 'POSTING', 'TRANSFER', 'LEAVE']),
  title: z.string().min(1),
  details: z.string().optional(),
  effectiveDate: z.string().min(1),
})

export const updateServiceHistorySchema = createServiceHistorySchema.partial()
