'use server';

import bcrypt from "bcryptjs";
import {cookies} from "next/headers";
import {prisma} from "@/connectionsDB/prisma";
import {ILoginFormValues, LoginStatus} from "@/api/Person/types/login.types";
import {createSessionToken} from "@/api/SessionToken/session";

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

    // 密码校验通过，签发 session token 并写入 httpOnly Cookie
    const token = await createSessionToken({
        userId: person.id,
        username: person.username,
        name: person.name,
    });

    (await cookies()).set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 天，需和 token 有效期一致
    });

    return {
        status: LoginStatus.SUCCESS,
        name: person.name,
    };
}
