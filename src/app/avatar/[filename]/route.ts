import {readFile} from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const MIME_TYPES: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".bmp": "image/bmp",
    ".heic": "image/heic",
    ".heif": "image/heif",
};

export async function GET(
    request: Request,
    context: {
        params: Promise<{
            filename: string;
        }>;
    }
) {
    const {filename} = await context.params;

    const safeFilename = path.basename(filename);

    // 防止路径穿越
    if (safeFilename !== filename) {
        return new Response("Invalid filename", {
            status: 400,
        });
    }

    // 你的头像文件名本身就是 UUID + 扩展名
    if (!/^[a-f0-9-]+\.(jpg|jpeg|png|webp|gif|bmp|heic|heif)$/i.test(safeFilename)) {
        return new Response("Invalid filename", {
            status: 400,
        });
    }

    const filePath = path.join(
        process.cwd(),
        "public",
        "avatars",
        safeFilename
    );

    try {
        const file = await readFile(filePath);
        const ext = path.extname(safeFilename).toLowerCase();
        const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

        return new Response(file, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control":
                    "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("读取头像失败:", filePath, error);
        return new Response("Avatar not found", {
            status: 404,
        });
    }
}