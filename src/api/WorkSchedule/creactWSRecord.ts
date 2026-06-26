'use server';

import {prisma} from "@/connectionsDB/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export default async function creactWSRecord(dt: string, name: string, banName: string) {
    const workDate = dayjs.utc(dt);
    const banType = await prisma.banType.findUnique({
        where: {banName: banName}
    });

    await prisma.workSchedule.upsert({
        where: {
            workDate_banTypeId: {
                workDate: workDate.toDate(),
                banTypeId: banType!.id,
            }
        },
        create: {
            workDate: workDate.toDate(),
            banType: {
                connect: {banName: banName}
            },
            scheduleAssignments: {
                create: {
                    person: {
                        connect: {name: name}
                    }
                }
            }
        },
        update: {
            scheduleAssignments: {
                create: {
                    person: {
                        connect: {name: name}
                    }
                }
            }
        }
    });
}