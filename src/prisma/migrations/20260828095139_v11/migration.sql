/*
  Warnings:

  - Added the required column `askOffAssignments` to the `AskOffApply` table without a default value. This is not possible if the table is not empty.
  - Added the required column `changeScheduleAssignments` to the `ChangeScheduleApply` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shiftScheduleAssignments` to the `ShiftScheduleApply` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AskOffApply" ADD COLUMN     "askOffAssignments" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "ChangeScheduleApply" ADD COLUMN     "changeScheduleAssignments" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "ShiftScheduleApply" ADD COLUMN     "shiftScheduleAssignments" JSONB NOT NULL;
