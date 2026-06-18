"use server";

import {prisma} from "@/connectionsDB/prisma";

export async function getBanTypeColorMap(): Promise<Record<string, string>> {
    const data = await prisma.banType.findMany({
        select: {
            banName: true,
            color: true,
        },
    });

    return Object.fromEntries(
        data.map(({banName, color}) => [banName, color])
    );
}