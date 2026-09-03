'use server';

import {prisma} from "@/prisma/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export async function cleanWS() {
    await prisma.workSchedule.deleteMany({
        where: {
            scheduleAssignments: {
                none: {},
            },
        }
    })
}