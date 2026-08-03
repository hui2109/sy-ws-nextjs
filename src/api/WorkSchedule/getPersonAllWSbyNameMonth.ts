'use server';

import "dotenv/config";
import {prisma} from "@/connectionsDB/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

// {'叶荣': {'2026-06-01': {'S1': [叶荣, 闫玉莹]}}}
export type PersonAllWSDateBansNamesMap = Record<string, Record<string, Record<string, string[]>>>;

export default async function getPersonAllWSbyNameMonth(dt: string, name: string): Promise<PersonAllWSDateBansNamesMap> {
    const date = dayjs.utc(dt);

    // 先查这个人这个月每一天的workSchedule ID
    const workSchedules = await prisma.workSchedule.findMany({
        where: {
            workDate: {
                gte: date.startOf('month').toDate(),
                lte: date.endOf('month').toDate(),
            },
            scheduleAssignments: {
                some: {
                    person: {
                        name: name
                    }
                }
            }
        },
        select: {
            id: true,
            banType: {
                select: {
                    banName: true
                }
            },
            workDate: true
        },
        orderBy: {
            workDate: "asc",
        },
    });

    // 然后根据workSchedule ID查找对应的排班记录
    const scheduleAssignmentsNames: Array<{ person: { name: string } }[]> = [];
    for (const {id} of workSchedules) {
        scheduleAssignmentsNames.push(
            await prisma.scheduleAssignment.findMany({
                where: {
                    workScheduleId: id
                },
                select: {
                    person: {
                        select: {
                            name: true
                        }
                    }
                }
            })
        )
    }

    const personAllWSDateBansNamesMap: PersonAllWSDateBansNamesMap = {[name]: {}};
    for (let i = 0; i < workSchedules.length; i++) {
        const workSchedule = workSchedules[i];
        const dateString: string = dayjs.utc(workSchedule.workDate).format("YYYY-MM-DD");
        const banName = workSchedule.banType.banName;

        if (!personAllWSDateBansNamesMap[name][dateString]) {
            personAllWSDateBansNamesMap[name][dateString] = {};
        }
        if (!personAllWSDateBansNamesMap[name][dateString][banName]) {
            personAllWSDateBansNamesMap[name][dateString][banName] = [];
        }
        personAllWSDateBansNamesMap[name][dateString][banName].push(...scheduleAssignmentsNames[i].map(d => d.person.name))
    }
    return personAllWSDateBansNamesMap;
}

// npx tsx src/api/WorkSchedule/getPersonAllWSbyNameMonth.ts
// getPersonAllWSbyNameMonth('2026-06-23', '张旭辉').then(r => console.log(r));
