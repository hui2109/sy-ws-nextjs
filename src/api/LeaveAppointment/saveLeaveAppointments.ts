'use server';

import "dotenv/config";
import {prisma} from "@/connectionsDB/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export interface ILeaveAppointmentData {
    sequenceNumber: number;
    appointmentDate: string;
    name: string;
    banName: string;
}

export default async function saveLeaveAppointments(leaveAppointments: ILeaveAppointmentData[]) {
    for (const leaveAppointment of leaveAppointments) {
        const person = await prisma.person.findUnique({
            where: {
                name: leaveAppointment.name
            }
        });
        const banType = await prisma.banType.findUnique({
            where: {
                banName: leaveAppointment.banName
            }
        });

        if (!person || !banType) continue;

        try {
            await prisma.leaveAppointment.create({
                data: {
                    sequenceNumber: leaveAppointment.sequenceNumber,
                    appointmentDate: dayjs.utc(leaveAppointment.appointmentDate).toDate(),
                    person: {
                        connect: {
                            id: person.id
                        }
                    },
                    banType: {
                        connect: {
                            id: banType.id
                        }
                    }
                }
            });
        } catch (error) {
            const message = String(error);
            if (message.indexOf('Unique constraint') !== -1) {
                return 'Unique constraint';
            }
            return String(error);
        }
    }
    return 'ok';
}