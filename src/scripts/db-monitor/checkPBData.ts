import "dotenv/config";
import {prisma} from "@/prisma/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import fs from "node:fs/promises";
import {ScheduleStatus} from "@/prisma/generated/enums";

dayjs.extend(utc);

type ScheduleData = {
    workDate: Date;
    status: ScheduleStatus;
    banType: {
        banName: string;
    };
}[];

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
        await sendPush(jsonToHtml(workSchedules));
    } else {
        console.log("数据未发生变化");
    }
}

async function sendPush(content: string) {
    const response = await fetch("https://www.pushplus.plus/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            token: "fae6c2938da0484ca1365341d2e519bf",
            title: "排班数据已变化",
            content,
            template: "html",
        }),
    });

    const data = await response.json();
    console.log(data);

    return data;
}

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (char) => {
        const map: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };
        return map[char];
    });
}

function jsonToHtml(data: ScheduleData): string {
    const rows = data.map(item => {
        const date = new Date(item.workDate).toLocaleDateString("zh-CN");
        const status = String(item.status);
        const banName = escapeHtml(item.banType.banName);

        return `<tr><td>${date}</td><td>${escapeHtml(status)}</td><td>${banName}</td></tr>`;
    }).join("");

    return `
    <h3>📅 排班通知</h3>
    <table border="1" cellpadding="8" cellspacing="0"
      style="border-collapse:collapse;width:100%;font-size:14px">
      <tr>
        <th>日期</th><th>状态</th><th>班次</th>
      </tr>
      ${rows}
    </table>
    <p>共 ${data.length} 条排班记录</p>
  `;
}

(async () => await checkPBData())();
// npx tsx src/scripts/db-monitor/checkPBData.ts
