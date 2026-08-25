-- AlterTable
ALTER TABLE "NextOfKin" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ServiceHistory" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "cadre" TEXT NOT NULL DEFAULT 'Not specified',
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Not specified';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP DEFAULT;
