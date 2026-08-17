import { z } from 'zod'

const staffStatus = z.enum(['Active', 'On leave', 'Probation'])

export const staffListQuerySchema = z.object({
  query: z.string().optional(),
  department: z.string().optional(),
})

export const createStaffSchema = z.object({
  name: z.string().min(1),
  staffId: z.string().min(1),
  designation: z.string().min(1),
  department: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  gender: z.string().optional(),
  status: staffStatus.optional(),
  grade: z.string().optional(),
  appointmentDate: z.string().optional(),
  location: z.string().optional(),
  nationality: z.string().optional(),
  dob: z.string().optional(),
  maritalStatus: z.string().optional(),
  nin: z.string().optional(),
  tin: z.string().optional(),
  pensionPin: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  bvn: z.string().optional(),
  ippis: z.string().optional(),
  pfa: z.string().optional(),
  bloodGroup: z.string().optional(),
  genotype: z.string().optional(),
  medicalFitness: z.string().optional(),
  photo: z.string().optional(),
})

export const updateStaffSchema = createStaffSchema.partial()

export const importStaffSchema = z.object({
  rows: z.array(createStaffSchema).min(1),
})
