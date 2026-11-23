'use server';

import {prisma} from "@/prisma/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export default async function creactWSRecords(dt: string, banName: string) {
    const workDate = dayjs.utc(dt);
    const banType = await prisma.banType.findUnique({where: {banName}});

    if (!banType) return;

    // 第一步：确保 workSchedule 存在，update 传空对象（已存在时不需要改任何字段）
    const workSchedule = await prisma.workSchedule.upsert({
        where: {
            workDate_banTypeId: {
                workDate: workDate.toDate(),
                banTypeId: banType.id,
            }
        },
        create: {
            workDate: workDate.toDate(),
            banType: {connect: {banName}},
        },
        update: {},
    });

    // 第二步：确保 scheduleAssignment 存在，skipDuplicates 静默跳过已有记录
    const people = await prisma.person.findMany({
        where: {
            isActive: true,
        },
        select: {
            id: true
        }
    });
    await prisma.scheduleAssignment.createMany({
        data: people.map(person => ({personId: person.id, workScheduleId: workSchedule.id})),
        skipDuplicates: true,
    });
}
