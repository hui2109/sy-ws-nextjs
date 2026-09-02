'use server';

import "dotenv/config";
import {prisma} from "@/prisma/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export default async function deleteLeaveApply(id: number) {
    await prisma.leaveApply.deleteMany({where: {id}});
    return null;
}