'use server';

import "dotenv/config";
import {prisma} from "@/connectionsDB/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export default async function deleteLeaveAppointments(name: string, days: number, starDate: string) {
    const start_date = dayjs.utc(starDate);
    const person = await prisma.person.findUnique({
        where: {
            name
        }
    });
    if (!person) return;

    for (let i = 0; i < days; i++) {
        const appointmentDate = start_date.add(i, 'day').toDate();
        await prisma.leaveAppointment.deleteMany({
            where: {
                appointmentDate,
                personId: person.id
            }
        })
    }
}