/*
  Warnings:

  - The values [SUBMITTED] on the enum `ApplyStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `banTypeId` on the `AskOffApply` table. All the data in the column will be lost.
  - You are about to drop the `AskOffApplyItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChangeScheduleApplyItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShiftScheduleApplyItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ApplyStatus_new" AS ENUM ('APPROVED', 'REJECTED', 'PENDING_REVIEW', 'DRAFT');
ALTER TABLE "public"."AskOffApply" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."ChangeScheduleApply" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."ShiftScheduleApply" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ShiftScheduleApply" ALTER COLUMN "status" TYPE "ApplyStatus_new" USING ("status"::text::"ApplyStatus_new");
ALTER TABLE "AskOffApply" ALTER COLUMN "status" TYPE "ApplyStatus_new" USING ("status"::text::"ApplyStatus_new");
ALTER TABLE "ChangeScheduleApply" ALTER COLUMN "status" TYPE "ApplyStatus_new" USING ("status"::text::"ApplyStatus_new");
ALTER TYPE "ApplyStatus" RENAME TO "ApplyStatus_old";
ALTER TYPE "ApplyStatus_new" RENAME TO "ApplyStatus";
DROP TYPE "public"."ApplyStatus_old";
ALTER TABLE "AskOffApply" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
ALTER TABLE "ChangeScheduleApply" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
ALTER TABLE "ShiftScheduleApply" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropForeignKey
ALTER TABLE "AskOffApply" DROP CONSTRAINT "AskOffApply_banTypeId_fkey";

-- DropForeignKey
ALTER TABLE "AskOffApplyItem" DROP CONSTRAINT "AskOffApplyItem_askOffApplyId_fkey";

-- DropForeignKey
ALTER TABLE "AskOffApplyItem" DROP CONSTRAINT "AskOffApplyItem_scheduleAssignmentId_fkey";

-- DropForeignKey
ALTER TABLE "ChangeScheduleApplyItem" DROP CONSTRAINT "ChangeScheduleApplyItem_changeScheduleApplyId_fkey";

-- DropForeignKey
ALTER TABLE "ChangeScheduleApplyItem" DROP CONSTRAINT "ChangeScheduleApplyItem_newBanTypeId_fkey";

-- DropForeignKey
ALTER TABLE "ChangeScheduleApplyItem" DROP CONSTRAINT "ChangeScheduleApplyItem_oldScheduleAssignmentId_fkey";

-- DropForeignKey
ALTER TABLE "ShiftScheduleApplyItem" DROP CONSTRAINT "ShiftScheduleApplyItem_myScheduleAssignmentId_fkey";

-- DropForeignKey
ALTER TABLE "ShiftScheduleApplyItem" DROP CONSTRAINT "ShiftScheduleApplyItem_shiftScheduleApplyId_fkey";

-- DropForeignKey
ALTER TABLE "ShiftScheduleApplyItem" DROP CONSTRAINT "ShiftScheduleApplyItem_targetScheduleAssignmentId_fkey";

-- AlterTable
ALTER TABLE "AskOffApply" DROP COLUMN "banTypeId",
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "ChangeScheduleApply" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "ShiftScheduleApply" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- DropTable
DROP TABLE "AskOffApplyItem";

-- DropTable
DROP TABLE "ChangeScheduleApplyItem";

-- DropTable
DROP TABLE "ShiftScheduleApplyItem";
