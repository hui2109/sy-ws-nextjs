'use server';

import "dotenv/config";
import {prisma} from "@/connectionsDB/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {getWSbyNameDateBanName} from "@/api/WorkSchedule/getWSbyNameDateBanName";

dayjs.extend(utc);

export default async function getAllRules(showHidden: boolean = false) {
    const allVacationRules = await prisma.vacationRule.findMany({
        where: {
            ...(showHidden ? {} : {isHidden: false})
        },
        select: {
            id: true,
            startDate: true,
            endDate: true,
            availableHalfDays: true,
            isHidden: true,
            person: {
                select: {
                    name: true
                }
            },
            banType: {
                select: {
                    banName: true,
                    color: true
                }
            }
        }
    });

    const rulesWithStats: Array<typeof allVacationRules[number] & { left_days: number; used_days: number }> = [];
    for (const rule of allVacationRules) {
        const WSRecords = await getWSbyNameDateBanName(rule.person.name, rule.startDate, rule.endDate, rule.banType.banName);
        const left_days = rule.availableHalfDays / 2 - WSRecords.length;
        const used_days = WSRecords.length;

        rulesWithStats.push({...rule, left_days, used_days});
    }

    return rulesWithStats;
}

// npx tsx src/api/VacationRule/getAllRules.ts
// getAllRules(true).then((rules) => {
//     console.log(rules);
// });