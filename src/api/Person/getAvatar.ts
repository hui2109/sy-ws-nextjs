'use server';

import {prisma} from "@/connectionsDB/prisma";

export async function getAvatar(name: string) {
    const person = await prisma.person.findUnique({
        where: {name},
        select: {
            avatar: true
        }
    });

    if (!person) {
        return null;
    }

    return person.avatar;
}