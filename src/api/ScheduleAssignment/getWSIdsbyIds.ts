import {prisma} from "@/prisma/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export default async function getWSIdsbyIds(scheduleAssignmentIds: number[]) {
    return Promise.all(
        scheduleAssignmentIds.map(async id => {
            const assignment = await prisma.scheduleAssignment.findUnique({
                where: {id},
                select: {
                    workScheduleId: true,
                },
            });

            return assignment?.workScheduleId ?? null;
        })
    );
}
