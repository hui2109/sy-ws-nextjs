import {prisma} from "@/prisma/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export default async function createScheduleAssignmentbyIds(personId: number, workScheduleId: number) {
    await prisma.scheduleAssignment.create({
        data: {
            personId,
            workScheduleId
        }
    });
}