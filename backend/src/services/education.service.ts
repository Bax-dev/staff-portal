import { educationModel } from '../models/education.model.js'
import type { CreateEducationInput, UpdateEducationInput } from '../types/staff-records.js'
import { parseOptionalDate } from '../utils/dates.js'
import { AppError } from '../utils/errors.js'
import { assertStaffRecord, requireStaff } from './require-staff.js'

export const educationService = {
  async list(staffId: string) {
    await requireStaff(staffId)
    return educationModel.findByStaffId(staffId)
  },

  async create(staffId: string, input: CreateEducationInput) {
    await requireStaff(staffId)
    return educationModel.create({
      institution: input.institution,
      qualification: input.qualification,
      fieldOfStudy: input.fieldOfStudy,
      startDate: parseOptionalDate(input.startDate),
      endDate: parseOptionalDate(input.endDate),
      staff: { connect: { id: staffId } },
    })
  },

  async update(staffId: string, id: string, input: UpdateEducationInput) {
    await requireStaff(staffId)
    const record = await educationModel.findById(id)
    if (!record) {
      throw new AppError(404, 'Education record not found')
    }
    assertStaffRecord(staffId, record.staffId, 'Education record')

    return educationModel.update(id, {
      institution: input.institution,
      qualification: input.qualification,
      fieldOfStudy: input.fieldOfStudy,
      startDate: parseOptionalDate(input.startDate),
      endDate: parseOptionalDate(input.endDate),
    })
  },

  async remove(staffId: string, id: string) {
    await requireStaff(staffId)
    const record = await educationModel.findById(id)
    if (!record) {
      throw new AppError(404, 'Education record not found')
    }
    assertStaffRecord(staffId, record.staffId, 'Education record')
    await educationModel.softDelete(id)
  },
}
