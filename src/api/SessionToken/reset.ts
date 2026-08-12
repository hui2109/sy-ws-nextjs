'use server';

import bcrypt from "bcryptjs";
import {prisma} from "@/connectionsDB/prisma";
import {IResetFormValues, ResetStatus} from "@/api/SessionToken/types/reset.types";
import {PSPrefix} from "@/configs/general";

export async function reset(resetFormValues: IResetFormValues) {
    const person = await prisma.person.findUnique({
        where: {
            name: resetFormValues.name,
            workNumber: resetFormValues.workNumber
        },
    });

    if (!person) {
        return {
            status: ResetStatus.NOT_FOUND,
        };
    }

    const newPassword = PSPrefix + resetFormValues.confirmPassword;
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.person.update({
        where: {
            id: person.id
        },
        data: {
            username: resetFormValues.newUsername,
            passwordHash
        }
    })

    return {
        status: ResetStatus.SUCCESS,
        name: person.name,
        username: resetFormValues.newUsername,
    };
}
