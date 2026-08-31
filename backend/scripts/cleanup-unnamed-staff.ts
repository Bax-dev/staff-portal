// One-off/manual counterpart to prisma/migrations/20260831110600_cleanup_unnamed_staff_imports.
// That migration already runs this cleanup automatically on every `npm run migrate:db`
// (production included). Use this script only for an ad-hoc run against a database
// that hasn't picked up that migration yet, or to check what would be removed with --dry-run.
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const dryRun = process.argv.includes('--dry-run')

async function main() {
  const junk = await prisma.staff.findMany({
    where: { name: 'Unnamed staff' },
    select: { id: true, staffCode: true, createdAt: true },
  })

  if (junk.length === 0) {
    console.log('No junk "Unnamed staff" records found.')
    return
  }

  console.log(`Found ${junk.length} junk record(s):`)
  for (const record of junk) {
    console.log(`  ${record.staffCode} (id ${record.id}, created ${record.createdAt.toISOString()})`)
  }

  if (dryRun) {
    console.log('\nDry run — nothing deleted. Re-run without --dry-run to delete.')
    return
  }

  const { count } = await prisma.staff.deleteMany({ where: { name: 'Unnamed staff' } })
  console.log(`\nDeleted ${count} record(s).`)
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
