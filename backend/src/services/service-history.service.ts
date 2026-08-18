import { serviceHistoryModel } from '../models/service-history.model.js'
import type { CreateServiceHistoryInput, UpdateServiceHistoryInput } from '../types/staff-records.js'
import { parseDisplayDate, parseOptionalDate } from '../utils/dates.js'
import { AppError } from '../utils/errors.js'
import { assertStaffRecord, requireStaff } from './require-staff.js'

export const serviceHistoryService = {
  async listAll() {
    const records = await serviceHistoryModel.findMany({
      include: { staff: { select: { name: true, staffCode: true } } },
    })

    return records.map((record) => ({
      id: record.id,
      staffId: record.staffId,
      type: record.type,
      title: record.title,
      details: record.details,
      effectiveDate: record.effectiveDate,
      staffName: record.staff.name,
      staffCode: record.staff.staffCode,
    }))
  },

  async list(staffId: string) {
    await requireStaff(staffId)
    return serviceHistoryModel.findByStaffId(staffId)
  },

  async create(staffId: string, input: CreateServiceHistoryInput) {
    await requireStaff(staffId)
    return serviceHistoryModel.create({
      type: input.type,
      title: input.title,
      details: input.details,
      effectiveDate: parseDisplayDate(input.effectiveDate),
      staff: { connect: { id: staffId } },
    })
  },

  async update(staffId: string, id: string, input: UpdateServiceHistoryInput) {
    await requireStaff(staffId)
    const record = await serviceHistoryModel.findById(id)
    if (!record) {
      throw new AppError(404, 'Service history record not found')
    }
    assertStaffRecord(staffId, record.staffId, 'Service history record')

    return serviceHistoryModel.update(id, {
      type: input.type,
      title: input.title,
      details: input.details,
      effectiveDate: parseOptionalDate(input.effectiveDate),
    })
  },

  async remove(staffId: string, id: string) {
    await requireStaff(staffId)
    const record = await serviceHistoryModel.findById(id)
    if (!record) {
      throw new AppError(404, 'Service history record not found')
    }
    assertStaffRecord(staffId, record.staffId, 'Service history record')
    await serviceHistoryModel.softDelete(id)
  },
}
