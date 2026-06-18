'use server';

import {prisma} from "@/connectionsDB/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {getValidStaff} from "./getValidStaff";

dayjs.extend(utc);

// {'叶荣': {'2026-06-01': ['S1'], '2026-06-02': ['S1', 'JD']}}
export type PersonDateBansMap = Record<string, Record<string, string[]>>;

export async function getWSbyMonth(dt: string): Promise<PersonDateBansMap> {
    const date = dayjs.utc(dt);
    const staffList = await getValidStaff();
    const workSchedules = await prisma.workSchedule.findMany({
        where: {
            workDate: {
                gte: date.startOf('month').toDate(),
                lte: date.endOf('month').toDate(),
            },
        },
        select: {
            workDate: true,
            banType: {
                select: {
                    banName: true,
                },
            },
            scheduleAssignments: {
                select: {
                    person: {
                        select: {
                            name: true,
                            displayOrder: true
                        },
                    },
                },
            },
        },
        orderBy: {
            workDate: "asc",
        },
    });

    const MonthSchedule: PersonDateBansMap = Object.fromEntries(staffList.map(staffName => [staffName, {}]));
    for (const schedule of workSchedules) {
        const dateString: string = dayjs.utc(schedule.workDate).format("YYYY-MM-DD");
        const banName = schedule.banType.banName;

        for (const {person} of schedule.scheduleAssignments) {
            if (MonthSchedule[person.name]) {
                if (!MonthSchedule[person.name][dateString]) {
                    MonthSchedule[person.name][dateString] = [];
                }
                MonthSchedule[person.name][dateString].push(banName);
            }
        }
    }

    return MonthSchedule
}



