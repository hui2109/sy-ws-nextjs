'use server';

import {prisma} from "@/prisma/prisma";

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
            banType: {
                select: {
                    color: true
                }
            }
        }
    });
}