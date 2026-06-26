"use server";

import {prisma} from "@/connectionsDB/prisma";

export default async function getValidBanNames() {
    const banNameList = await prisma.banType.findMany({
        where: {
            isActive: true
        },
        select: {
            banName: true,
        },
    });

    return banNameList.map(banName => banName.banName);
}