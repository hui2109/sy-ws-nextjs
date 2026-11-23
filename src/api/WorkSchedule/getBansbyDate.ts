'use server';

import "dotenv/config";
import {prisma} from "@/prisma/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export async function getBansbyDate(dt: string): Promise<string[]> {
    const date = dayjs.utc(dt);
    const workSchedules = await prisma.workSchedule.findMany({
        where: {
            workDate: {
                equals: date.toDate()
            }
        },
        select: {
            banType: {
                select: {
                    banName: true,
                },
            },
        },
    });
    return [...new Set(workSchedules.map(workSchedule => workSchedule.banType.banName))];
}

// npx tsx src/api/WorkSchedule/getBansbyDate.ts
// getBansbyDate('2026-06-23').then(r => console.log(r));