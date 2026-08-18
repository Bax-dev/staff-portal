import { PrismaClient, UserRole } from '@prisma/client'
import { hashPassword } from '../src/utils/password.js'

const prisma = new PrismaClient()

const orgUnits = [
  {
    name: 'Planning and Budget',
    children: ['Monitoring and Evaluation', 'Project Planning', 'ICT', 'Budget'],
  },
  {
    name: 'Investigation and Design',
    children: ['Investigation', 'Design', 'Survey', 'Laboratory'],
  },
  {
    name: 'Hydrology',
    children: ['Integrated River Basin Management (IRBM)', 'Hydromet'],
  },
] as const

async function seedDepartments() {
  const root = await prisma.department.upsert({
    where: { name: 'Planning and Design' },
    update: {},
    create: { name: 'Planning and Design' },
  })

  for (const unit of orgUnits) {
    const branch = await prisma.department.upsert({
      where: { name: unit.name },
      update: { parentId: root.id },
      create: { name: unit.name, parentId: root.id },
    })

    for (const child of unit.children) {
      await prisma.department.upsert({
        where: { name: child },
        update: { parentId: branch.id },
        create: { name: child, parentId: branch.id },
      })
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
