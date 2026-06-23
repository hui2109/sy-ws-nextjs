'use server';

import {prisma} from "@/connectionsDB/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export async function auditWSbyMonth(dt: string) {
    const date = dayjs.utc(dt);
    await prisma.workSchedule.updateMany({
        where: {
            workDate: {
                gte: date.startOf('month').toDate(),
                lte: date.endOf('month').toDate(),
            },
        },
        data: {
            status: 'PUBLISHED',
        }
    });
}