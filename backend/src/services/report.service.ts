import { departmentModel } from '../models/department.model.js'
import { staffModel } from '../models/staff.model.js'
import { toStaffDto } from './staff.mapper.js'

export const reportService = {
  async overview() {
    const [staff, departmentCount, activeCount] = await Promise.all([
      staffModel.findMany({ orderBy: { updatedAt: 'desc' } }),
      departmentModel.count(),
      staffModel.count({ status: 'ACTIVE' }),
    ])

    return {
      totalStaff: staff.length,
      activeStaff: activeCount,
      departments: departmentCount,
      recentStaff: staff.slice(0, 4).map(toStaffDto),
    }
  },

  async workforce() {
    const staff = await staffModel.findMany({})
    const dtos = staff.map(toStaffDto)

    const byDepartment = dtos.reduce<Record<string, number>>((result, person) => {
      result[person.department] = (result[person.department] ?? 0) + 1
      return result
    }, {})

    return {
      active: dtos.filter((person) => person.status === 'Active').length,
      female: dtos.filter((person) => person.gender === 'Female').length,
      male: dtos.filter((person) => person.gender === 'Male').length,
      onLeave: dtos.filter((person) => person.status === 'On leave').length,
      byDepartment,
    }
  },
}
