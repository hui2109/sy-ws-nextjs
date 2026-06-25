'use server';

import {prisma} from "@/connectionsDB/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export default async function findExpectedSchedulebyNameDate(name: string, dt: string) {
    const date = dayjs.utc(dt);
    const appointments = await prisma.expectedSchedule.findMany({
        where: {
            person: {
                name: name
            },
            appointmentDate: {
                equals: date.toDate(),
            }
        },
        select: {
            sequenceNumber: true,
            banType: {
                select: {
                    banName: true,
                    color: true
                }
            }
        }
    })

    if (appointments.length === 0) {
        return null;
    }

    return {
        banName: appointments[0].banType.banName,
        sequenceNumber: String(appointments[0].sequenceNumber),
        color: appointments[0].banType.color,
    }
}