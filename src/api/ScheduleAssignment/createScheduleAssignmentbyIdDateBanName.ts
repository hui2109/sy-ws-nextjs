import {prisma} from "@/prisma/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import createScheduleAssignmentbyIds from "@/api/ScheduleAssignment/createScheduleAssignmentbyIds";

dayjs.extend(utc);

export default async function createScheduleAssignmentbyIdDateBanName(personId: number, dt: string, banName: string) {
    const banType = await prisma.banType.findUnique({where: {banName}});
    const workDate = dayjs.utc(dt).toDate();
    if (!banType) return null;

    const workSchedule = await prisma.workSchedule.upsert({
        where: {
            workDate_banTypeId: {
                workDate,
                banTypeId: banType.id
            }
        },
        create: {
            workDate,
            status: 'PUBLISHED',
            banTypeId: banType.id
        },
        update: {}
    });

    await createScheduleAssignmentbyIds(personId, workSchedule.id);
}