'use server';

import {prisma} from "@/prisma/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export async function getWSbyNameDateBanName(name: string, startDate: Date, endDate: Date, banName: string) {
    return prisma.workSchedule.findMany({
        where: {
            workDate: {
                gte: dayjs.utc(startDate).toDate(),
                lte: dayjs.utc(endDate).toDate()
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
            id: true,
            banType: {
                select: {
                    color: true
                }
            }
        }
    });
}

export async function getPublishedWSIndexRecords(names: string[], startDate: Date, endDate: Date, banNames: string[]) {
    if (!names.length || !banNames.length) return [];

    return prisma.scheduleAssignment.findMany({
        where: {
            person: {
                name: {in: names}
            },
            workSchedule: {
                status: "PUBLISHED",
                workDate: {
                    gte: dayjs.utc(startDate).toDate(),
                    lte: dayjs.utc(endDate).toDate()
                },
                banType: {
                    banName: {in: banNames}
                }
            }
        },
        select: {
            person: {
                select: {
                    name: true
                }
            },
            workSchedule: {
                select: {
                    workDate: true,
                    banType: {
                        select: {
                            banName: true
                        }
                    }
                }
            }
        }
    });
}
