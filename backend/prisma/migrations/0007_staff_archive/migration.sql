-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'ARCHIVE';
ALTER TYPE "AuditAction" ADD VALUE 'UNARCHIVE';

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN "archivedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Staff_archivedAt_idx" ON "Staff"("archivedAt");
