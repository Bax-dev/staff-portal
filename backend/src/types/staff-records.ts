export type CreateEducationInput = {
  institution: string
  qualification: string
  fieldOfStudy?: string
  startDate?: string
  endDate?: string
}

export type UpdateEducationInput = Partial<CreateEducationInput>

export type CreateCertificationInput = {
  name: string
  issuer: string
  issuedDate?: string
  expiryDate?: string
  certificateNumber?: string
}

export type UpdateCertificationInput = Partial<CreateCertificationInput>

export type CreateFamilyMemberInput = {
  name: string
  relationship: string
  dateOfBirth?: string
  gender?: string
  phone?: string
}

export type UpdateFamilyMemberInput = Partial<CreateFamilyMemberInput>

export type CreateEmergencyContactInput = {
  name: string
  relationship: string
  phone: string
  email?: string
  address?: string
}

export type UpdateEmergencyContactInput = Partial<CreateEmergencyContactInput>

export type CreateNextOfKinInput = {
  name: string
  relationship: string
  phone: string
  address?: string
}

export type UpdateNextOfKinInput = Partial<CreateNextOfKinInput>

export type ServiceHistoryTypeLabel = 'PROMOTION' | 'POSTING' | 'TRANSFER' | 'LEAVE'

export type CreateServiceHistoryInput = {
  type: ServiceHistoryTypeLabel
  title: string
  details?: string
  effectiveDate: string
}

export type UpdateServiceHistoryInput = Partial<CreateServiceHistoryInput>
