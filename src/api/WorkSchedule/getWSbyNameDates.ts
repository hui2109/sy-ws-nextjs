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
        if (!dateBansMap[dayjs(workSchedule.workDate).format('YYYY-MM-DD')]) {
            dateBansMap[dayjs(workSchedule.workDate).format('YYYY-MM-DD')] = [];
        }
        for (const scheduleAssignment of workSchedule.scheduleAssignments) {
            dateBansMap[dayjs(workSchedule.workDate).format('YYYY-MM-DD')].push([workSchedule.banType.banName, scheduleAssignment.id])
        }
    }

    return dateBansMap;
}

// npx tsx src/api/WorkSchedule/getWSbyNameDates.ts
// getWSbyNameDates('张旭辉', '2026-06-15', '2026-06-19').then(r => console.log(r));