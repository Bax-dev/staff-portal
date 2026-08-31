import { DepartmentType, PrismaClient, Screen, UserRole } from '@prisma/client'
import { hashPassword } from '../src/utils/password.js'

const prisma = new PrismaClient()

const orgUnits = [
  {
    name: 'Planning',
    formerNames: ['Planning and Budget'],
    children: ['Monitoring and Evaluation', 'Project Planning', 'ICT', 'Budget'],
  },
  {
    name: 'Investigation',
    formerNames: ['Investigation and Design'],
    children: ['Design', 'Survey', 'Laboratory'],
  },
  {
    name: 'Hydrology',
    formerNames: [],
    children: ['Integrated River Basin Management (IRBM)', 'Hydromet'],
  },
] as const

async function upsertDepartment(
  name: string,
  parentId: string | null,
  type: DepartmentType,
  formerNames: readonly string[] = [],
) {
  for (const formerName of formerNames) {
    const existing = await prisma.department.findUnique({ where: { name: formerName } })
    if (!existing) continue

    // The target name may already belong to a different row (e.g. a former
    // child unit sharing the name its parent branch is being renamed to).
    // Merge that row into the one we're renaming before applying the rename.
    const conflict = await prisma.department.findUnique({ where: { name } })
    if (conflict && conflict.id !== existing.id) {
      await prisma.department.updateMany({ where: { parentId: conflict.id }, data: { parentId: existing.id } })
      await prisma.staff.updateMany({ where: { departmentId: conflict.id }, data: { departmentId: existing.id } })
      await prisma.department.delete({ where: { id: conflict.id } })
    }

    return prisma.department.update({ where: { id: existing.id }, data: { name, parentId, type } })
  }

  return prisma.department.upsert({
    where: { name },
    update: { parentId, type },
    create: { name, parentId, type },
  })
}

async function seedDepartments() {
  const root = await upsertDepartment('Directorate: Planning and Design Directorate', null, DepartmentType.DIRECTORATE, [
    'Planning and Design',
  ])

  for (const unit of orgUnits) {
    const branch = await upsertDepartment(unit.name, root.id, DepartmentType.DEPARTMENT, unit.formerNames)

    for (const child of unit.children) {
      await upsertDepartment(child, branch.id, DepartmentType.UNIT)
    }
  }
}

async function seedUsers() {
  const passwordHash = await hashPassword('password123')

  await prisma.user.upsert({
    where: { email: 'admin@smp.gov.ng' },
    update: { passwordHash },
    create: {
      email: 'admin@smp.gov.ng',
      name: 'Admin Officer',
      passwordHash,
      role: UserRole.ADMINISTRATOR,
    },
  })

  await prisma.user.upsert({
    where: { email: 'staff@smp.gov.ng' },
    update: { passwordHash },
    create: {
      email: 'staff@smp.gov.ng',
      name: 'Staff Officer',
      passwordHash,
      role: UserRole.OFFICER,
    },
  })
}

async function seedPermissions() {
  const staffUser = await prisma.user.findUnique({ where: { email: 'staff@smp.gov.ng' } })
  if (!staffUser) return

  // admin@smp.gov.ng gets no UserPermission rows: its ADMINISTRATOR role will
  // bypass the permission table entirely once permission checks are wired up
  // in a later phase, so seeding rows for it here would be dead data.
  const viewOnlyScreens = [Screen.OVERVIEW, Screen.DIRECTORY, Screen.DOCUMENTS, Screen.REPORTS]

  for (const screen of viewOnlyScreens) {
    await prisma.userPermission.upsert({
      where: { userId_screen: { userId: staffUser.id, screen } },
      update: { canView: true, canEdit: false, canDelete: false },
      create: { userId: staffUser.id, screen, canView: true, canEdit: false, canDelete: false },
    })
  }
}

async function seedSettings() {
  const existing = await prisma.settings.findFirst()
  if (!existing) {
    await prisma.settings.create({
      data: {
        organizationName: 'Planning and Design Directorate',
        defaultExportFormat: 'XLSX',
      },
    })
  }
}

async function main() {
  await seedDepartments()
  await seedUsers()
  await seedPermissions()
  await seedSettings()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error: unknown) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
