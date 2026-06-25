'use server';

import {prisma} from "@/connectionsDB/prisma";

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