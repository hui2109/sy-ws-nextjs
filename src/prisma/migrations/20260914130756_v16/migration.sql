-- CreateIndex
CREATE INDEX "ScheduleAssignment_workScheduleId_personId_idx" ON "ScheduleAssignment"("workScheduleId", "personId");

-- CreateIndex
CREATE INDEX "WorkSchedule_banTypeId_status_workDate_idx" ON "WorkSchedule"("banTypeId", "status", "workDate");
