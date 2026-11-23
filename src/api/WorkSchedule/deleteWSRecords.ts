'use server';

import {prisma} from "@/prisma/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export async function deleteWSRecords(dt: string, banName: string) {
    const workDate = dayjs.utc(dt);
    const banType = await prisma.banType.findUnique({where: {banName}});

    if (!banType) return;

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
            workScheduleId: workSchedule.id,
        }
    });

    // 当workSchedule下没有任何的scheduleAssignment时，将此workSchedule也删了
    await prisma.workSchedule.deleteMany({
        where: {
            id: workSchedule.id,
            scheduleAssignments: {
                none: {},
            },
        }
    })
}
