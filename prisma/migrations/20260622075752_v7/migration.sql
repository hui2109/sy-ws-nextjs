-- DropForeignKey
ALTER TABLE "AskOffApplyItem" DROP CONSTRAINT "AskOffApplyItem_scheduleAssignmentId_fkey";

-- DropForeignKey
ALTER TABLE "ChangeScheduleApplyItem" DROP CONSTRAINT "ChangeScheduleApplyItem_oldScheduleAssignmentId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleAssignment" DROP CONSTRAINT "ScheduleAssignment_workScheduleId_fkey";

-- DropForeignKey
ALTER TABLE "ShiftScheduleApplyItem" DROP CONSTRAINT "ShiftScheduleApplyItem_myScheduleAssignmentId_fkey";

-- DropForeignKey
ALTER TABLE "ShiftScheduleApplyItem" DROP CONSTRAINT "ShiftScheduleApplyItem_targetScheduleAssignmentId_fkey";

-- AddForeignKey
ALTER TABLE "ShiftScheduleApplyItem" ADD CONSTRAINT "ShiftScheduleApplyItem_myScheduleAssignmentId_fkey" FOREIGN KEY ("myScheduleAssignmentId") REFERENCES "ScheduleAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftScheduleApplyItem" ADD CONSTRAINT "ShiftScheduleApplyItem_targetScheduleAssignmentId_fkey" FOREIGN KEY ("targetScheduleAssignmentId") REFERENCES "ScheduleAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AskOffApplyItem" ADD CONSTRAINT "AskOffApplyItem_scheduleAssignmentId_fkey" FOREIGN KEY ("scheduleAssignmentId") REFERENCES "ScheduleAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeScheduleApplyItem" ADD CONSTRAINT "ChangeScheduleApplyItem_oldScheduleAssignmentId_fkey" FOREIGN KEY ("oldScheduleAssignmentId") REFERENCES "ScheduleAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleAssignment" ADD CONSTRAINT "ScheduleAssignment_workScheduleId_fkey" FOREIGN KEY ("workScheduleId") REFERENCES "WorkSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
