'use server';

import {prisma} from "@/prisma/prisma";
import {mkdir, unlink, writeFile} from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const ALLOWED_MIME_TO_EXT: Record<string, string> = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/bmp": ".bmp",
    "image/heic": ".heic",
    "image/heif": ".heif",
};

export async function saveAvatar(name: string, file: File) {
    // Server Action 可以脱离前端被直接调用，前端 beforeAvatarUpload 的
    // 校验不能作为唯一防线，这里必须再做一遍
    const ext = ALLOWED_MIME_TO_EXT[file.type];
    if (!ext) {
        throw new Error("不支持的图片格式");
    }

    const uploadDir = path.join(process.cwd(), "public", "avatars");
    await mkdir(uploadDir, {recursive: true});

    const existing = await prisma.person.findUnique({
        where: {name},
        select: {avatar: true},
    });

    // 文件名不再拼用户可控的 name，只用服务端生成的 uuid + 白名单里的扩展名，
    // 避免任何形式的路径穿越或扩展名伪造
    const filename = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    const arrayBuffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(arrayBuffer));

    const avatarUrl = `/avatars/${filename}`;

    await prisma.person.update({
        where: {name},
        data: {avatar: avatarUrl},
    });

    if (existing?.avatar && existing.avatar !== avatarUrl) {
        const oldFilePath = path.join(process.cwd(), "public", existing.avatar);
        await unlink(oldFilePath).catch(() => {
        });
    }

    return avatarUrl;
}
