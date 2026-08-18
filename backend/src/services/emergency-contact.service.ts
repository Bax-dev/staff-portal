import { emergencyContactModel } from '../models/emergency-contact.model.js'
import type { CreateEmergencyContactInput, UpdateEmergencyContactInput } from '../types/staff-records.js'
import { AppError } from '../utils/errors.js'
import { assertStaffRecord, requireStaff } from './require-staff.js'

export const emergencyContactService = {
  async list(staffId: string) {
    await requireStaff(staffId)
    return emergencyContactModel.findByStaffId(staffId)
  },

  async create(staffId: string, input: CreateEmergencyContactInput) {
    await requireStaff(staffId)
    return emergencyContactModel.create({
      name: input.name,
      relationship: input.relationship,
      phone: input.phone,
      email: input.email || undefined,
      address: input.address,
      staff: { connect: { id: staffId } },
    })
  },

  async update(staffId: string, id: string, input: UpdateEmergencyContactInput) {
    await requireStaff(staffId)
    const record = await emergencyContactModel.findById(id)
    if (!record) {
      throw new AppError(404, 'Emergency contact not found')
    }
    assertStaffRecord(staffId, record.staffId, 'Emergency contact')

    return emergencyContactModel.update(id, {
      name: input.name,
      relationship: input.relationship,
      phone: input.phone,
      email: input.email || undefined,
      address: input.address,
    })
  },

  async remove(staffId: string, id: string) {
    await requireStaff(staffId)
    const record = await emergencyContactModel.findById(id)
    if (!record) {
      throw new AppError(404, 'Emergency contact not found')
    }
    assertStaffRecord(staffId, record.staffId, 'Emergency contact')
    await emergencyContactModel.softDelete(id)
  },
}
