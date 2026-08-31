-- CreateEnum
CREATE TYPE "DepartmentType" AS ENUM ('DIRECTORATE', 'DEPARTMENT', 'UNIT');

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "type" "DepartmentType" NOT NULL DEFAULT 'UNIT';
