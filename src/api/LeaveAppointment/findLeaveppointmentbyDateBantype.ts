'use server';

import {prisma} from "@/connectionsDB/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export default async function findLeaveppointmentbyDateBantype(dt: string, name: string) {
    const date = dayjs.utc(dt);
    const appointments = await prisma.leaveAppointment.findMany({
        where: {
            appointmentDate: {
                equals: date.toDate(),
            },
            person: {
                name: {not: name}
            }
        },
        select: {
            sequenceNumber: true,
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
        },
        orderBy: {
            sequenceNumber: 'asc'
        }
    });

    if (appointments.length === 0) {
        return null;
    }

    return appointments.map(({sequenceNumber, person, banType}) => ({
        sequenceNumber: sequenceNumber,
        name: person.name,
        banName: banType.banName,
        color: banType.color,
    }))
}