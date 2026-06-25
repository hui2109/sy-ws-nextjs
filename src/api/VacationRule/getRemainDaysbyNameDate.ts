'use server';

import "dotenv/config";
import {prisma} from "@/connectionsDB/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export default async function getRemainDaysbyNameDate(name: string, current_date: string) {
    const date = dayjs.utc(current_date);
    const banNameRemainDaysMap: { key: string, days: number, color: string }[] = [];

    const validVacationRules = await prisma.vacationRule.findMany({
        where: {
            startDate: {
                lte: date.toDate(),
            },
            endDate: {
                gte: date.toDate(),
            },
            isHidden: false,
            person: {
                name: name
            }
        },
        select: {
            startDate: true,
            endDate: true,
            availableHalfDays: true,
            banType: {
                select: {
                    banName: true,
                    color: true
                }
            }
        }
    });
    for (const rule of validVacationRules) {
        const WSRecords = await getWSbyNameDateBanName(name, rule.startDate, rule.endDate, rule.banType.banName);
        banNameRemainDaysMap.push({key: rule.banType.banName, days: (rule.availableHalfDays) / 2 - WSRecords.length, color: rule.banType.color});
    }

    // 手动计算 [调休假] 的总天数及剩余天数
    const startDate = date.startOf('year').toDate();
    const endDate = date.endOf('year').toDate();
    const bu_jia = await getWSbyNameDateBanName(name, startDate, endDate, '补假');
    const tiao_xiu_jia = await getWSbyNameDateBanName(name, startDate, endDate, '调休假');
    banNameRemainDaysMap.push({key: '调休假', days: bu_jia.length - tiao_xiu_jia.length, color: tiao_xiu_jia?.[0]?.banType?.color});

    return banNameRemainDaysMap;
}

export async function getWSbyNameDateBanName(name: string, startDate: Date, endDate: Date, banName: string) {
    return prisma.workSchedule.findMany({
        where: {
            workDate: {
                gte: startDate,
                lte: endDate
            },
            banType: {
                banName: banName
            },
            scheduleAssignments: {
                some: {
                    person: {
                        name: name
                    }
                }
            },
            status: "PUBLISHED"
        },
        select: {
            workDate: true,
            banType: {
                select: {
                    banName: true,
                    color: true
                }
            },
            scheduleAssignments: {
                where: {
                    person: {
                        name: name
                    }
                },
                select: {
                    person: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    });
}

// npx tsx src/api/VacationRule/getRemainDays.ts
// getRemainDaysbyNameDate('张旭辉', '2026-06-25');