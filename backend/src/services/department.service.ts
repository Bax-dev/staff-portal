import { departmentModel } from '../models/department.model.js'
import { AppError } from '../utils/errors.js'

export const departmentService = {
  async list() {
    const departments = await departmentModel.findAll()
    return departments.map((department) => ({
      id: department.id,
      name: department.name,
      parentId: department.parentId,
      children: department.children.map((child) => ({
        id: child.id,
        name: child.name,
      })),
    }))
  },

  async tree() {
    const departments = await departmentModel.findAll()
    const roots = departments.filter((department) => !department.parentId)

    return roots.map((root) => ({
      id: root.id,
      name: root.name,
      children: departments
        .filter((department) => department.parentId === root.id)
        .map((branch) => ({
          id: branch.id,
          name: branch.name,
          children: branch.children.map((unit) => ({
            id: unit.id,
            name: unit.name,
          })),
        })),
    }))
  },

  async getByName(name: string) {
    const department = await departmentModel.findByName(name)
    if (!department) {
      throw new AppError(404, 'Department not found')
    }
    return department
  },
}
