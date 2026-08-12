'use server';

import {prisma} from "@/connectionsDB/prisma";
import {access} from "node:fs/promises";
import path from "node:path";

export async function getAvatar(name: string) {
    const person = await prisma.person.findUnique({
        where: {name},
        select: {
            avatar: true
        }
    });

    if (!person?.avatar) {
        return null;
    }

    // avatar 存的是形如 /avatars/xxx.png 的公开路径，
    // 对应磁盘上的真实文件是 public/avatars/xxx.png，
    // 数据库有记录不代表文件真的还在（重启、多实例、手动清理都可能导致文件丢失）
    const filePath = path.join(process.cwd(), "public", person.avatar);

    try {
        await access(filePath);
        return person.avatar;
    } catch {
        // 文件不存在，说明数像处理据库记录是脏数据，直接当没有头
        return null;
    }
}
