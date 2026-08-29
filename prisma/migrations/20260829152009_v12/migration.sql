/*
  Warnings:

  - You are about to drop the `AskOffApply` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChangeScheduleApply` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShiftScheduleApply` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "LeaveApplyStatus" AS ENUM ('APPROVED', 'REJECTED', 'PENDING_REVIEW', 'DRAFT');

-- CreateEnum
CREATE TYPE "LeaveApplyType" AS ENUM ('SHIFT_SCHEDULE', 'ASKOFF', 'CHANGE_SCHEDULE');

-- DropForeignKey
ALTER TABLE "AskOffApply" DROP CONSTRAINT "AskOffApply_personId_fkey";

-- DropForeignKey
ALTER TABLE "ChangeScheduleApply" DROP CONSTRAINT "ChangeScheduleApply_personId_fkey";

-- DropForeignKey
ALTER TABLE "ShiftScheduleApply" DROP CONSTRAINT "ShiftScheduleApply_applicantId_fkey";

-- DropForeignKey
ALTER TABLE "ShiftScheduleApply" DROP CONSTRAINT "ShiftScheduleApply_targetPersonId_fkey";

-- DropTable
DROP TABLE "AskOffApply";

-- DropTable
DROP TABLE "ChangeScheduleApply";

-- DropTable
DROP TABLE "ShiftScheduleApply";

-- DropEnum
DROP TYPE "ApplyStatus";

-- CreateTable
CREATE TABLE "LeaveApply" (
    "id" SERIAL NOT NULL,
    "leaveApplyType" "LeaveApplyType" NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "LeaveApplyStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentUserId" INTEGER NOT NULL,
    "targetStaffId" INTEGER,
    "assignmentsJson" JSONB NOT NULL,

    CONSTRAINT "LeaveApply_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LeaveApply" ADD CONSTRAINT "LeaveApply_currentUserId_fkey" FOREIGN KEY ("currentUserId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveApply" ADD CONSTRAINT "LeaveApply_targetStaffId_fkey" FOREIGN KEY ("targetStaffId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;
