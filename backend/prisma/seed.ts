import { PrismaClient, StaffStatus, UserRole } from '@prisma/client'
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

const initialStaff: Array<{
  staffCode: string
  name: string
  designation: string
  department: string
  email: string
  phone: string
  gender: string
  status: StaffStatus
  grade: string
  appointmentDate: Date
  location: string
  nationality: string
  dateOfBirth: Date
  maritalStatus: string
}> = [
  {
    staffCode: 'PD-001',
    name: 'Engr. Amina Yusuf',
    designation: 'Director, Planning and Design',
    department: 'Planning and Design',
    email: 'amina.yusuf@organo.gov.ng',
    phone: '+234 803 445 1200',
    gender: 'Female',
    status: 'ACTIVE',
    grade: 'GL 17 / Step 9',
    appointmentDate: new Date('2018-02-14'),
    location: 'Abuja',
    nationality: 'Nigerian',
    dateOfBirth: new Date('1975-06-22'),
    maritalStatus: 'Married',
  },
  {
    staffCode: 'PB-014',
    name: 'Mr. Chinedu Okafor',
    designation: 'Deputy Director, Budget',
    department: 'Planning and Budget',
    email: 'chinedu.okafor@organo.gov.ng',
    phone: '+234 806 110 2288',
    gender: 'Male',
    status: 'ACTIVE',
    grade: 'GL 16 / Step 7',
    appointmentDate: new Date('2019-09-02'),
    location: 'Abuja',
    nationality: 'Nigerian',
    dateOfBirth: new Date('1981-03-04'),
    maritalStatus: 'Married',
  },
  {
    staffCode: 'PB-021',
    name: 'Mrs. Fatima Bello',
    designation: 'Chief Planning Officer',
    department: 'Planning and Budget',
    email: 'fatima.bello@organo.gov.ng',
    phone: '+234 809 552 3901',
    gender: 'Female',
    status: 'ON_LEAVE',
    grade: 'GL 15 / Step 5',
    appointmentDate: new Date('2020-11-11'),
    location: 'Kaduna',
    nationality: 'Nigerian',
    dateOfBirth: new Date('1984-10-18'),
    maritalStatus: 'Married',
  },
  {
    staffCode: 'HY-003',
    name: 'Dr. Ibrahim Musa',
    designation: 'Chief Hydrologist',
    department: 'Hydrology',
    email: 'ibrahim.musa@organo.gov.ng',
    phone: '+234 802 770 4412',
    gender: 'Male',
    status: 'ACTIVE',
    grade: 'GL 15 / Step 8',
    appointmentDate: new Date('2017-05-08'),
    location: 'Kano',
    nationality: 'Nigerian',
    dateOfBirth: new Date('1978-01-09'),
    maritalStatus: 'Married',
  },
  {
    staffCode: 'ID-018',
    name: 'Ms. Grace Eze',
    designation: 'Senior Investigation Officer',
    department: 'Investigation and Design',
    email: 'grace.eze@organo.gov.ng',
    phone: '+234 807 229 6540',
    gender: 'Female',
    status: 'PROBATION',
    grade: 'GL 13 / Step 2',
    appointmentDate: new Date('2025-01-19'),
    location: 'Enugu',
    nationality: 'Nigerian',
    dateOfBirth: new Date('1990-08-27'),
    maritalStatus: 'Single',
  },
  {
    staffCode: 'ICT-006',
    name: 'Mr. Tunde Adeyemi',
    designation: 'ICT Manager',
    department: 'ICT',
    email: 'tunde.adeyemi@organo.gov.ng',
    phone: '+234 805 994 3310',
    gender: 'Male',
    status: 'ACTIVE',
    grade: 'GL 14 / Step 6',
    appointmentDate: new Date('2021-07-27'),
    location: 'Ibadan',
    nationality: 'Nigerian',
    dateOfBirth: new Date('1986-12-12'),
    maritalStatus: 'Married',
  },
]

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

async function seedStaff() {
  for (const person of initialStaff) {
    const department = await prisma.department.findUniqueOrThrow({
      where: { name: person.department },
    })

    await prisma.staff.upsert({
      where: { staffCode: person.staffCode },
      update: {},
      create: {
        staffCode: person.staffCode,
        name: person.name,
        designation: person.designation,
        departmentId: department.id,
        email: person.email,
        phone: person.phone,
        gender: person.gender,
        status: person.status,
        grade: person.grade,
        appointmentDate: person.appointmentDate,
        location: person.location,
        nationality: person.nationality,
        dateOfBirth: person.dateOfBirth,
        maritalStatus: person.maritalStatus,
      },
    })
  }
}

async function seedUsers() {
  const passwordHash = await hashPassword('password123')

  await prisma.user.upsert({
    where: { email: 'admin@organo.gov.ng' },
    update: { passwordHash },
    create: {
      email: 'admin@organo.gov.ng',
      name: 'Admin Officer',
      passwordHash,
      role: UserRole.ADMINISTRATOR,
    },
  })

  await prisma.user.upsert({
    where: { email: 'staff@organo.gov.ng' },
    update: { passwordHash },
    create: {
      email: 'staff@organo.gov.ng',
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
  await seedStaff()
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
