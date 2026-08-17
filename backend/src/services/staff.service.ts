import type { Prisma } from '@prisma/client'
import { departmentModel } from '../models/department.model.js'
import { staffModel } from '../models/staff.model.js'
import type { CreateStaffInput, StaffListQuery, UpdateStaffInput } from '../types/staff.js'
import { AppError } from '../utils/errors.js'
import { toStaffDto, toStaffWriteData } from './staff.mapper.js'

async function resolveDepartment(name: string) {
  const department = await departmentModel.findByName(name)
  if (!department) {
    throw new AppError(400, `Unknown department: ${name}`)
  }
  return department
}

export const staffService = {
  async list({ query, department }: StaffListQuery) {
    const where: Prisma.StaffWhereInput = {}

    if (department && department !== 'All departments') {
      where.department = { name: department }
    }

    if (query?.trim()) {
      const term = query.trim()
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { staffCode: { contains: term, mode: 'insensitive' } },
        { designation: { contains: term, mode: 'insensitive' } },
        { department: { name: { contains: term, mode: 'insensitive' } } },
      ]
    }

    const records = await staffModel.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return records.map(toStaffDto)
  },

  async getById(id: string) {
    const staff = await staffModel.findById(id)
    if (!staff) {
      throw new AppError(404, 'Staff record not found')
    }
    return toStaffDto(staff)
  },

  async create(input: CreateStaffInput) {
    const existing = await staffModel.findByStaffCode(input.staffId)
    if (existing) {
      throw new AppError(409, 'A staff record with this ID already exists')
    }

    const department = await resolveDepartment(input.department)
    const { departmentId, ...data } = toStaffWriteData(input, department.id)
    const staff = await staffModel.create({
      ...data,
      department: { connect: { id: departmentId } },
    })

    return toStaffDto(staff)
  },

  async update(id: string, input: UpdateStaffInput) {
    const current = await staffModel.findById(id)
    if (!current) {
      throw new AppError(404, 'Staff record not found')
    }

    const departmentName = input.department ?? current.department.name
    const department = await resolveDepartment(departmentName)
    const { departmentId, ...data } = toStaffWriteData(
      {
        name: input.name ?? current.name,
        staffId: input.staffId ?? current.staffCode,
        designation: input.designation ?? current.designation,
        department: departmentName,
        email: input.email ?? current.email,
        phone: input.phone ?? current.phone,
        gender: input.gender ?? current.gender,
        grade: input.grade ?? current.grade,
        location: input.location ?? current.location,
        nationality: input.nationality ?? current.nationality,
        maritalStatus: input.maritalStatus ?? current.maritalStatus,
        ...input,
      },
      department.id,
    )
    const staff = await staffModel.update(id, {
      ...data,
      department: { connect: { id: departmentId } },
    })

    return toStaffDto(staff)
  },

  async remove(id: string) {
    const current = await staffModel.findById(id)
    if (!current) {
      throw new AppError(404, 'Staff record not found')
    }
    await staffModel.softDelete(id)
  },

  async importMany(rows: CreateStaffInput[]) {
    const created = []
    for (const row of rows) {
      created.push(await this.create(row))
    }
    return created
  },
}
