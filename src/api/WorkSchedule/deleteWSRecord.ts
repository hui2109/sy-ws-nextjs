'use server';

import {prisma} from "@/connectionsDB/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export async function deleteWSRecord(dt: string, banName: string, name: string) {
    const workDate = dayjs.utc(dt);

    // 两个查询互相独立，并行发出
    const [banType, person] = await Promise.all([
        prisma.banType.findUnique({where: {banName}}),
        prisma.person.findUnique({where: {name}}),
    ]);

    if (!banType || !person) return;

    const workSchedule = await prisma.workSchedule.findUnique({
        where: {
            workDate_banTypeId: {
                workDate: workDate.toDate(),
                banTypeId: banType.id,
            }
        }
    });

    if (!workSchedule) return;

    // deleteMany：记录不存在时静默跳过，不抛错
    await prisma.scheduleAssignment.deleteMany({
        where: {
            personId: person.id,
            workScheduleId: workSchedule.id,
        }
    });
}
