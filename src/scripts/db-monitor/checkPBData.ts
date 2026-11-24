import "dotenv/config";
import {prisma} from "@/prisma/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import fs from "node:fs/promises";

dayjs.extend(utc);

export async function checkPBData(): Promise<void> {
    const start_date = dayjs().format('YYYY-MM-DD');
    const end_date = dayjs().startOf('month').add(1, 'month').endOf('month').format('YYYY-MM-DD');

    const workSchedules = await prisma.workSchedule.findMany({
        where: {
            workDate: {
                gte: dayjs.utc(start_date).toDate(),
                lte: dayjs.utc(end_date).toDate(),
            }
        },
        select: {
            workDate: true,
            banType: {
                select: {
                    banName: true
                }
            },
            status: true
        },
        orderBy: {
            workDate: 'desc'
        }
    });

    const fileUrl = new URL("./cache.json", import.meta.url);
    let content: string;

    // 读取本地缓存结果
    try {
        content = await fs.readFile(fileUrl, "utf-8");
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            // 缓存文件不存在, 直接使用当前查询结果创建
            await fs.writeFile(
                fileUrl,
                JSON.stringify(workSchedules, null, 2),
                "utf-8"
            );
            return;
        }
        throw error;
    }
    const cache: unknown = JSON.parse(content);

    // 对比当前缓存和数据库查询结果
    if (JSON.stringify(cache) !== JSON.stringify(workSchedules)) {
        await fs.writeFile(
            fileUrl,
            JSON.stringify(workSchedules, null, 2),
            "utf-8"
        );
        console.log("检测到数据变化, 缓存已更新");
    } else {
        console.log("数据未发生变化");
    }
}

(async () => await checkPBData())();
// npx tsx src/scripts/db-monitor/checkPBData.ts
