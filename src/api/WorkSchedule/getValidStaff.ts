'use server';

import {prisma} from "@/connectionsDB/prisma";

export async function getValidStaff(): Promise<string[]> {
    const staffList = await prisma.person.findMany({
        where: {isActive: true},
        select: {name: true},
        orderBy: {displayOrder: 'asc'},
    });
    return staffList.map(staff => staff.name);
}