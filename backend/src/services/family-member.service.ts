import { familyMemberModel } from '../models/family-member.model.js'
import type { CreateFamilyMemberInput, UpdateFamilyMemberInput } from '../types/staff-records.js'
import { parseOptionalDate } from '../utils/dates.js'
import { AppError } from '../utils/errors.js'
import { assertStaffRecord, requireStaff } from './require-staff.js'

export const familyMemberService = {
  async list(staffId: string) {
    await requireStaff(staffId)
    return familyMemberModel.findByStaffId(staffId)
  },

  async create(staffId: string, input: CreateFamilyMemberInput) {
    await requireStaff(staffId)
    return familyMemberModel.create({
      name: input.name,
      relationship: input.relationship,
      dateOfBirth: parseOptionalDate(input.dateOfBirth),
      gender: input.gender,
      phone: input.phone,
      staff: { connect: { id: staffId } },
    })
  },

  async update(staffId: string, id: string, input: UpdateFamilyMemberInput) {
    await requireStaff(staffId)
    const record = await familyMemberModel.findById(id)
    if (!record) {
      throw new AppError(404, 'Family member not found')
    }
    assertStaffRecord(staffId, record.staffId, 'Family member')

    return familyMemberModel.update(id, {
      name: input.name,
      relationship: input.relationship,
      dateOfBirth: parseOptionalDate(input.dateOfBirth),
      gender: input.gender,
      phone: input.phone,
    })
  },

  async remove(staffId: string, id: string) {
    await requireStaff(staffId)
    const record = await familyMemberModel.findById(id)
    if (!record) {
      throw new AppError(404, 'Family member not found')
    }
    assertStaffRecord(staffId, record.staffId, 'Family member')
    await familyMemberModel.softDelete(id)
  },
}
