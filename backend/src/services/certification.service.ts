import { certificationModel } from '../models/certification.model.js'
import type { CreateCertificationInput, UpdateCertificationInput } from '../types/staff-records.js'
import { parseOptionalDate } from '../utils/dates.js'
import { AppError } from '../utils/errors.js'
import { assertStaffRecord, requireStaff } from './require-staff.js'

export const certificationService = {
  async list(staffId: string) {
    await requireStaff(staffId)
    return certificationModel.findByStaffId(staffId)
  },

  async create(staffId: string, input: CreateCertificationInput) {
    await requireStaff(staffId)
    return certificationModel.create({
      name: input.name,
      issuer: input.issuer,
      issuedDate: parseOptionalDate(input.issuedDate),
      expiryDate: parseOptionalDate(input.expiryDate),
      certificateNumber: input.certificateNumber,
      staff: { connect: { id: staffId } },
    })
  },

  async update(staffId: string, id: string, input: UpdateCertificationInput) {
    await requireStaff(staffId)
    const record = await certificationModel.findById(id)
    if (!record) {
      throw new AppError(404, 'Certification not found')
    }
    assertStaffRecord(staffId, record.staffId, 'Certification')

    return certificationModel.update(id, {
      name: input.name,
      issuer: input.issuer,
      issuedDate: parseOptionalDate(input.issuedDate),
      expiryDate: parseOptionalDate(input.expiryDate),
      certificateNumber: input.certificateNumber,
    })
  },

  async remove(staffId: string, id: string) {
    await requireStaff(staffId)
    const record = await certificationModel.findById(id)
    if (!record) {
      throw new AppError(404, 'Certification not found')
    }
    assertStaffRecord(staffId, record.staffId, 'Certification')
    await certificationModel.softDelete(id)
  },
}
