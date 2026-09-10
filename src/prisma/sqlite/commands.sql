TRUNCATE TABLE "ScheduleAssignment", "WorkSchedule" RESTART IDENTITY;
TRUNCATE TABLE "LeaveAppointment" RESTART IDENTITY;
TRUNCATE TABLE "VacationRule" RESTART IDENTITY;
TRUNCATE TABLE "LeaveApply" RESTART IDENTITY;

SELECT setval(
               pg_get_serial_sequence('"WorkSchedule"', 'id'),
               COALESCE(MAX("id"), 1)
       )
FROM "WorkSchedule";

SELECT setval(
               pg_get_serial_sequence('"ScheduleAssignment"', 'id'),
               COALESCE(MAX("id"), 1)
       )
FROM "ScheduleAssignment";

SELECT setval(
               pg_get_serial_sequence('"LeaveAppointment"', 'id'),
               COALESCE(MAX("id"), 1)
       )
FROM "LeaveAppointment";

SELECT setval(
               pg_get_serial_sequence('"VacationRule"', 'id'),
               COALESCE(MAX("id"), 1)
       )
FROM "VacationRule";
