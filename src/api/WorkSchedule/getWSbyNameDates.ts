'use server';

import "dotenv/config";
import {prisma} from "@/prisma/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export async function getWSbyNameDates(name: string, startDate: string, endDate: string) {
    const start_date = dayjs.utc(startDate);
    const end_date = dayjs.utc(endDate);

    const workSchedules = await prisma.workSchedule.findMany({
        where: {
            workDate: {
                gte: start_date.toDate(),
                lte: end_date.toDate(),
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
            scheduleAssignments: {
                where: {
                    person: {
                        name
                    }
                },
                select: {
                    id: true
                }
            }
        }
    });

    const dateBansMap: Record<string, [string, number][]> = {};
    for (const workSchedule of workSchedules) {
        const format_date = dayjs(workSchedule.workDate).format('YYYY-MM-DD');

        if (!dateBansMap[format_date]) {
            dateBansMap[format_date] = [];
        }
        for (const scheduleAssignment of workSchedule.scheduleAssignments) {
            dateBansMap[format_date].push([workSchedule.banType.banName, scheduleAssignment.id])
        }
    }

    return dateBansMap;
}

// npx tsx src/api/WorkSchedule/getWSbyNameDates.ts
getWSbyNameDates('张旭辉', '2026-01-01', '2026-12-31').then(r => console.log(r));