-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('PUBLISHED', 'PENDING_REVIEW', 'DRAFT');

-- CreateEnum
CREATE TYPE "ApplyStatus" AS ENUM ('APPROVED', 'REJECTED', 'PENDING_REVIEW', 'SUBMITTED');

-- CreateTable
CREATE TABLE "Person"
(
    "id"           SERIAL           NOT NULL,
    "username"     TEXT             NOT NULL,
    "passwordHash" TEXT             NOT NULL,
    "avatar"       TEXT             NOT NULL,
    "name"         TEXT             NOT NULL,
    "weight"       DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "hireDate"     DATE             NOT NULL,
    "workNumber"   TEXT             NOT NULL,
    "phoneNumber"  TEXT             NOT NULL,
    "createdAt"    TIMESTAMPTZ(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMPTZ(3)   NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BanType"
(
    "id"          SERIAL         NOT NULL,
    "banCode"     TEXT           NOT NULL,
    "banName"     TEXT           NOT NULL,
    "startTime"   TIME(0)        NOT NULL,
    "endTime"     TIME(0)        NOT NULL,
    "description" TEXT           NOT NULL,
    "isActive"    BOOLEAN        NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "BanType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkSchedule"
(
    "id"        SERIAL           NOT NULL,
    "workDate"  DATE             NOT NULL,
    "status"    "ScheduleStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMPTZ(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3)   NOT NULL,
    "banTypeId" INTEGER          NOT NULL,

    CONSTRAINT "WorkSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VacationRule"
(
    "id"                SERIAL         NOT NULL,
    "startDate"         DATE           NOT NULL,
    "endDate"           DATE           NOT NULL,
    "availableHalfDays" INTEGER        NOT NULL,
    "isHidden"          BOOLEAN        NOT NULL DEFAULT false,
    "createdAt"         TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMPTZ(3) NOT NULL,
    "personId"          INTEGER        NOT NULL,
    "banTypeId"         INTEGER        NOT NULL,

    CONSTRAINT "VacationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveAppointment"
(
    "id"              SERIAL         NOT NULL,
    "sequenceNumber"  INTEGER        NOT NULL,
    "appointmentDate" DATE           NOT NULL,
    "createdAt"       TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMPTZ(3) NOT NULL,
    "personId"        INTEGER        NOT NULL,
    "banTypeId"       INTEGER        NOT NULL,

    CONSTRAINT "LeaveAppointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpectedSchedule"
(
    "id"              SERIAL         NOT NULL,
    "sequenceNumber"  INTEGER        NOT NULL,
    "appointmentDate" DATE           NOT NULL,
    "createdAt"       TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMPTZ(3) NOT NULL,
    "personId"        INTEGER        NOT NULL,
    "banTypeId"       INTEGER        NOT NULL,

    CONSTRAINT "ExpectedSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftScheduleApply"
(
    "id"             SERIAL         NOT NULL,
    "startDate"      DATE           NOT NULL,
    "endDate"        DATE           NOT NULL,
    "reason"         TEXT,
    "status"         "ApplyStatus"  NOT NULL DEFAULT 'SUBMITTED',
    "createdAt"      TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMPTZ(3) NOT NULL,
    "applicantId"    INTEGER        NOT NULL,
    "targetPersonId" INTEGER        NOT NULL,

    CONSTRAINT "ShiftScheduleApply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftScheduleApplyItem"
(
    "id"                         SERIAL  NOT NULL,
    "shiftScheduleApplyId"       INTEGER NOT NULL,
    "myScheduleAssignmentId"     INTEGER NOT NULL,
    "targetScheduleAssignmentId" INTEGER NOT NULL,

    CONSTRAINT "ShiftScheduleApplyItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AskOffApply"
(
    "id"        SERIAL         NOT NULL,
    "startDate" DATE           NOT NULL,
    "endDate"   DATE           NOT NULL,
    "reason"    TEXT,
    "status"    "ApplyStatus"  NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "personId"  INTEGER        NOT NULL,
    "banTypeId" INTEGER        NOT NULL,

    CONSTRAINT "AskOffApply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AskOffApplyItem"
(
    "id"                   SERIAL  NOT NULL,
    "askOffApplyId"        INTEGER NOT NULL,
    "scheduleAssignmentId" INTEGER NOT NULL,

    CONSTRAINT "AskOffApplyItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeScheduleApply"
(
    "id"        SERIAL         NOT NULL,
    "startDate" DATE           NOT NULL,
    "endDate"   DATE           NOT NULL,
    "reason"    TEXT,
    "status"    "ApplyStatus"  NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "personId"  INTEGER        NOT NULL,

    CONSTRAINT "ChangeScheduleApply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeScheduleApplyItem"
(
    "id"                      SERIAL  NOT NULL,
    "changeScheduleApplyId"   INTEGER NOT NULL,
    "oldScheduleAssignmentId" INTEGER NOT NULL,
    "newWorkDate"             DATE    NOT NULL,
    "newBanTypeId"            INTEGER NOT NULL,

    CONSTRAINT "ChangeScheduleApplyItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleAssignment"
(
    "id"             SERIAL  NOT NULL,
    "personId"       INTEGER NOT NULL,
    "workScheduleId" INTEGER NOT NULL,

    CONSTRAINT "ScheduleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Person_username_key" ON "Person" ("username");

-- CreateIndex
CREATE UNIQUE INDEX "Person_workNumber_key" ON "Person" ("workNumber");

-- CreateIndex
CREATE UNIQUE INDEX "BanType_banCode_key" ON "BanType" ("banCode");

-- CreateIndex
CREATE UNIQUE INDEX "WorkSchedule_workDate_banTypeId_key" ON "WorkSchedule" ("workDate", "banTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "VacationRule_startDate_endDate_personId_banTypeId_key" ON "VacationRule" ("startDate", "endDate", "personId", "banTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveAppointment_appointmentDate_personId_key" ON "LeaveAppointment" ("appointmentDate", "personId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpectedSchedule_appointmentDate_personId_key" ON "ExpectedSchedule" ("appointmentDate", "personId");

-- CreateIndex
CREATE UNIQUE INDEX "ShiftScheduleApplyItem_shiftScheduleApplyId_myScheduleAssig_key" ON "ShiftScheduleApplyItem" ("shiftScheduleApplyId", "myScheduleAssignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "ShiftScheduleApplyItem_shiftScheduleApplyId_targetScheduleA_key" ON "ShiftScheduleApplyItem" ("shiftScheduleApplyId", "targetScheduleAssignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "AskOffApplyItem_askOffApplyId_scheduleAssignmentId_key" ON "AskOffApplyItem" ("askOffApplyId", "scheduleAssignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "ChangeScheduleApplyItem_changeScheduleApplyId_oldScheduleAs_key" ON "ChangeScheduleApplyItem" ("changeScheduleApplyId", "oldScheduleAssignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleAssignment_personId_workScheduleId_key" ON "ScheduleAssignment" ("personId", "workScheduleId");

-- AddForeignKey
ALTER TABLE "WorkSchedule"
    ADD CONSTRAINT "WorkSchedule_banTypeId_fkey" FOREIGN KEY ("banTypeId") REFERENCES "BanType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VacationRule"
    ADD CONSTRAINT "VacationRule_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VacationRule"
    ADD CONSTRAINT "VacationRule_banTypeId_fkey" FOREIGN KEY ("banTypeId") REFERENCES "BanType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveAppointment"
    ADD CONSTRAINT "LeaveAppointment_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveAppointment"
    ADD CONSTRAINT "LeaveAppointment_banTypeId_fkey" FOREIGN KEY ("banTypeId") REFERENCES "BanType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpectedSchedule"
    ADD CONSTRAINT "ExpectedSchedule_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpectedSchedule"
    ADD CONSTRAINT "ExpectedSchedule_banTypeId_fkey" FOREIGN KEY ("banTypeId") REFERENCES "BanType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftScheduleApply"
    ADD CONSTRAINT "ShiftScheduleApply_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftScheduleApply"
    ADD CONSTRAINT "ShiftScheduleApply_targetPersonId_fkey" FOREIGN KEY ("targetPersonId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftScheduleApplyItem"
    ADD CONSTRAINT "ShiftScheduleApplyItem_shiftScheduleApplyId_fkey" FOREIGN KEY ("shiftScheduleApplyId") REFERENCES "ShiftScheduleApply" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftScheduleApplyItem"
    ADD CONSTRAINT "ShiftScheduleApplyItem_myScheduleAssignmentId_fkey" FOREIGN KEY ("myScheduleAssignmentId") REFERENCES "ScheduleAssignment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftScheduleApplyItem"
    ADD CONSTRAINT "ShiftScheduleApplyItem_targetScheduleAssignmentId_fkey" FOREIGN KEY ("targetScheduleAssignmentId") REFERENCES "ScheduleAssignment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AskOffApply"
    ADD CONSTRAINT "AskOffApply_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AskOffApply"
    ADD CONSTRAINT "AskOffApply_banTypeId_fkey" FOREIGN KEY ("banTypeId") REFERENCES "BanType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AskOffApplyItem"
    ADD CONSTRAINT "AskOffApplyItem_askOffApplyId_fkey" FOREIGN KEY ("askOffApplyId") REFERENCES "AskOffApply" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AskOffApplyItem"
    ADD CONSTRAINT "AskOffApplyItem_scheduleAssignmentId_fkey" FOREIGN KEY ("scheduleAssignmentId") REFERENCES "ScheduleAssignment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeScheduleApply"
    ADD CONSTRAINT "ChangeScheduleApply_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeScheduleApplyItem"
    ADD CONSTRAINT "ChangeScheduleApplyItem_changeScheduleApplyId_fkey" FOREIGN KEY ("changeScheduleApplyId") REFERENCES "ChangeScheduleApply" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeScheduleApplyItem"
    ADD CONSTRAINT "ChangeScheduleApplyItem_oldScheduleAssignmentId_fkey" FOREIGN KEY ("oldScheduleAssignmentId") REFERENCES "ScheduleAssignment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeScheduleApplyItem"
    ADD CONSTRAINT "ChangeScheduleApplyItem_newBanTypeId_fkey" FOREIGN KEY ("newBanTypeId") REFERENCES "BanType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleAssignment"
    ADD CONSTRAINT "ScheduleAssignment_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleAssignment"
    ADD CONSTRAINT "ScheduleAssignment_workScheduleId_fkey" FOREIGN KEY ("workScheduleId") REFERENCES "WorkSchedule" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
