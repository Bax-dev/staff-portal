import { staffModel } from '../models/staff.model.js'
import { AppError } from '../utils/errors.js'

export async function requireStaff(staffId: string) {
  const staff = await staffModel.findById(staffId)
  if (!staff) {
    throw new AppError(404, 'Staff record not found')
  }
  return staff
}

export function assertStaffRecord(staffId: string, recordStaffId: string, label: string) {
  if (recordStaffId !== staffId) {
    throw new AppError(404, `${label} not found`)
  }
}
