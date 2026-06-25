'use server';

import {prisma} from "@/connectionsDB/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export default async function findExpectedSchedulebyDateBanName(dt: string, banName: string, name: string) {
    const date = dayjs.utc(dt);
    const appointments = await prisma.expectedSchedule.findMany({
        where: {
            appointmentDate: {
                equals: date.toDate(),
            },
            banType: {
                banName: banName
            },
            person: {
                name: {not: name}
            }
        },
        select: {
            sequenceNumber: true,
            person: {
                select: {
                    name: true,
                }
            },
        },
        orderBy: {
            sequenceNumber: 'asc'
        }
    });

    if (appointments.length === 0) {
        return null;
    }

    return appointments.map(({sequenceNumber, person}) => ({
        sequenceNumber: String(sequenceNumber),
        name: person.name
    }))
}