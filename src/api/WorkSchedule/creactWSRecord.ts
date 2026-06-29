'use server';

import {prisma} from "@/connectionsDB/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export default async function creactWSRecord(dt: string, name: string, banName: string) {
    const workDate = dayjs.utc(dt);

    // 两个查询互相独立，并行发出，顺手补上 null 守卫
    const [banType, person] = await Promise.all([
        prisma.banType.findUnique({where: {banName}}),
        prisma.person.findUnique({where: {name}}),
    ]);

    if (!banType || !person) return;

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
    await prisma.scheduleAssignment.createMany({
        data: [{personId: person.id, workScheduleId: workSchedule.id}],
        skipDuplicates: true,
    });
}
