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