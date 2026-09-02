'use server';

import "dotenv/config";
import {prisma} from "@/prisma/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export interface ILeaveAppointmentData {
    name: string;
    banName: string;
    color: string
}

export default async function getLeaveAppointmentbyDate(dt: string): Promise<Record<string, ILeaveAppointmentData>> {
    const date = dayjs.utc(dt);
    const appointments = await prisma.leaveAppointment.findMany({
        where: {
            appointmentDate: {
                gte: date.startOf('month').toDate(),
                lte: date.endOf('month').toDate(),
            }
        },
        select: {
            sequenceNumber: true,
            appointmentDate: true,
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
            appointmentDate: "asc",
        },
    });

    const LADateData: Record<string, ILeaveAppointmentData> = {};
    appointments.map(appointment => {
        const key_ = dayjs.utc(appointment.appointmentDate).format('YYYY-MM-DD') + '_' + appointment.sequenceNumber;
        LADateData[key_] = {
            name: appointment.person.name,
            banName: appointment.banType.banName,
            color: appointment.banType.color
        }
    });
    return LADateData;
}

// npx tsx src/api/LeaveAppointment/getLeaveAppointmentbyDate.ts
// getLeaveAppointmentbyDate('2026-07-01').then((data) => {
//     console.log(data);
// })