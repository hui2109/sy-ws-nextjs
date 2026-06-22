'use server';

import {prisma} from "@/connectionsDB/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export async function clearWSbyMonth(dt: string) {
    const date = dayjs.utc(dt);
    await prisma.workSchedule.deleteMany({
        where: {
            workDate: {
                gte: date.startOf('month').toDate(),
                lte: date.endOf('month').toDate(),
            },
        },
    });
}