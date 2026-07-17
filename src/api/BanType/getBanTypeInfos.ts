"use server";

import {prisma} from "@/connectionsDB/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export interface IBanTypeInfo {
    banName: string;
    startTime: string;
    endTime: string;
    description: string;
    color: string;
}

export default async function getBanTypeInfos(banNames: string[]) {
    const banTypeInfos: Array<IBanTypeInfo> = [];
    for (const banName of banNames) {
        const banType = await prisma.banType.findUnique({
            where: {
                banName: banName
            }
        });
        if (banType) {
            banTypeInfos.push({
                banName: banType.banName,
                startTime: dayjs.utc(banType.startTime).format('HH:mm'),
                endTime: dayjs.utc(banType.endTime).format('HH:mm'),
                description: banType.description,
                color: banType.color
            });
        }
    }

    return banTypeInfos;
}