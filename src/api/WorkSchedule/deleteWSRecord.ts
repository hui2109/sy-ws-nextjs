'use server';

import {prisma} from "@/connectionsDB/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export async function deleteWSRecord(dt: string, banName: string, name: string) {
    const workDate = dayjs.utc(dt);
    const banType = await prisma.banType.findUnique({
        where: {banName: banName}
    });
    const workSchedule = await prisma.workSchedule.findUnique({
        where: {
            workDate_banTypeId: {
                workDate: workDate.toDate(),
                banTypeId: banType!.id,
            }
        }
    });
    const person = await prisma.person.findUnique({
        where: {name: name}
    });

    await prisma.scheduleAssignment.delete({
        where: {
            personId_workScheduleId: {
                personId: person!.id,
                workScheduleId: workSchedule!.id,
            }
        }
    })
}