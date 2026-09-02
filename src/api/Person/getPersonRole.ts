'use server';

import "dotenv/config";
import {prisma} from "@/prisma/prisma";

export async function getPersonRole(name: string) {
    const person = await prisma.person.findUnique({where: {name}});
    return person?.role ?? null;
}
