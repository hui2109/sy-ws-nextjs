'use server';

import "dotenv/config";
import {prisma} from "@/connectionsDB/prisma";

export async function getValidStaff(onlyValidStaff: boolean = true): Promise<string[]> {
    const staffList = await prisma.person.findMany({
        where: {
            isActive: onlyValidStaff || {}
        },
        select: {name: true},
        orderBy: {displayOrder: 'asc'},
    });
    return staffList.map(staff => staff.name);
}

// npx tsx src/api/Person/getValidStaff.ts
// getValidStaff(false).then((data) => {
//     console.log(data);
// })
