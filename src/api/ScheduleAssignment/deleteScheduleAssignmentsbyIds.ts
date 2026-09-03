import {prisma} from "@/prisma/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export default async function deleteScheduleAssignmentsbyIds(ids: number[]) {
    await prisma.scheduleAssignment.deleteMany({
        where: {
            id: {
                in: ids
            }
        }
    });
}