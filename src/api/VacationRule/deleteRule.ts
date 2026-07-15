'use server';

import "dotenv/config";
import {prisma} from "@/connectionsDB/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export default async function deleteRule(key: number) {
    prisma.vacationRule.deleteMany({
        where: {
            id: key
        }
    });
}