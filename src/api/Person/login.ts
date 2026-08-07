'use server';

import bcrypt from "bcryptjs";
import {prisma} from "@/connectionsDB/prisma";
import {ILoginFormValues, LoginStatus} from "@/api/Person/types/login.types";

export async function login(loginFormValues: ILoginFormValues) {
    const person = await prisma.person.findUnique({
        where: {
            username: loginFormValues.username,
        },
    });

    if (!person) {
        return {
            status: LoginStatus.NOT_FOUND,
        };
    }

    const passwordMatched = await bcrypt.compare(
        loginFormValues.password,
        person.passwordHash,
    );

    if (!passwordMatched) {
        return {
            status: LoginStatus.VERIFY_ERROR,
        };
    }

    return {
        status: LoginStatus.SUCCESS,
        name: person.name,
    };
}
