import { nextOfKinModel } from '../models/next-of-kin.model.js'
import type { CreateNextOfKinInput, UpdateNextOfKinInput } from '../types/staff-records.js'
import { AppError } from '../utils/errors.js'
import { assertStaffRecord, requireStaff } from './require-staff.js'

export const nextOfKinService = {
  async list(staffId: string) {
    await requireStaff(staffId)
    return nextOfKinModel.findByStaffId(staffId)
  },

  async create(staffId: string, input: CreateNextOfKinInput) {
    await requireStaff(staffId)
    return nextOfKinModel.create({
      name: input.name,
      relationship: input.relationship,
      phone: input.phone,
      address: input.address,
      staff: { connect: { id: staffId } },
    })
  },

  async update(staffId: string, id: string, input: UpdateNextOfKinInput) {
    await requireStaff(staffId)
    const record = await nextOfKinModel.findById(id)
    if (!record) {
      throw new AppError(404, 'Next of kin not found')
    }
    assertStaffRecord(staffId, record.staffId, 'Next of kin')

    return nextOfKinModel.update(id, {
      name: input.name,
      relationship: input.relationship,
      phone: input.phone,
      address: input.address,
    })
  },

  async remove(staffId: string, id: string) {
    await requireStaff(staffId)
    const record = await nextOfKinModel.findById(id)
    if (!record) {
      throw new AppError(404, 'Next of kin not found')
    }
    assertStaffRecord(staffId, record.staffId, 'Next of kin')
    await nextOfKinModel.softDelete(id)
  },
}
