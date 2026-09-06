'use server';

import "dotenv/config";
import {prisma} from "@/prisma/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export async function getWSbyNameYear(name: string, year: number) {
    const workSchedules = await prisma.workSchedule.findMany({
        where: {
            workDate: {
                gte: dayjs.utc(`${year}-01-01`).toDate(),
                lt: dayjs.utc(`${year + 1}-01-01`).toDate(),
            },
            status: 'PUBLISHED',
            scheduleAssignments: {
                some: {
                    person: {
                        name
                    }
                }
            }
        },
        select: {
            workDate: true,
            banType: {
                select: {
                    banName: true
                }
            },
        },
        orderBy: {
            workDate: 'asc'
        }
    });

    const yearMonthBanCount: Record<number, Record<number, Record<string, number>>> = {};
    for (const workSchedule of workSchedules) {
        const date = dayjs.utc(workSchedule.workDate);
        const workYear = date.year();
        const workMonth = date.month() + 1; // dayjs 的 month() 是 0~11
        const banName = workSchedule.banType.banName;

        // 初始化年份
        yearMonthBanCount[workYear] ??= {};

        // 初始化月份
        yearMonthBanCount[workYear][workMonth] ??= {};

        // 初始化班种，并累加
        yearMonthBanCount[workYear][workMonth][banName] ??= 0;
        yearMonthBanCount[workYear][workMonth][banName]++;
    }

    return yearMonthBanCount;
}

// npx tsx src/api/WorkSchedule/getWSbyNameYear.ts
// getWSbyNameYear('张旭辉', 2026).then(r => console.log(r));
