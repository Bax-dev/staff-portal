-- AlterTable
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN "photo" TEXT;
