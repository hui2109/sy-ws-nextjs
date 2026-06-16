/**
 * POST /api/work-schedule/getWorkSchedulebyMonth
 *
 * 获取指定月份的排班信息。
 *
 * 请求体 (JSON):
 * {
 *   year:  number   // 年份，如 2024
 *   month: number   // 月份，1-12
 * }
 *
 * 响应体 (JSON):
 * {
 *   success: true,
 *   data: Array<{ [personName: string]: { [date: string]: string } }>
 *   // date 格式: "YYYY-MM-DD"，值为班次代码，如 "S1"
 * }
 */

import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/connectionsDB/prisma";


// ─────────────────────────────────────────────
// 类型定义
// ─────────────────────────────────────────────

interface RequestBody {
    year: number;
    month: number;
}

/** 单人排班：{ "2024-01-01": "S1", "2024-01-02": "S2", ... } */
type PersonScheduleMap = Record<string, string>;

/** 接口最终返回的数组元素：{ "叶荣": { ... } } */
type PersonScheduleEntry = Record<string, PersonScheduleMap>;

// ─────────────────────────────────────────────
// 工具函数
// ─────────────────────────────────────────────

/**
 * 将 Date 对象格式化为 "YYYY-MM-DD" 字符串。
 * 使用 UTC 方法，避免时区偏移导致日期偏移一天。
 */
function formatDate(date: Date): string {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/**
 * 根据年份和月份（1-12），返回该月第一天和最后一天的 Date（UTC 零点）。
 */
function getMonthRange(year: number, month: number): { start: Date; end: Date } {
    const start = new Date(Date.UTC(year, month - 1, 1));
    // 取下个月第一天再减 1ms，得到当月最后一天 23:59:59.999 UTC
    const end = new Date(Date.UTC(year, month, 1) - 1);
    return {start, end};
}

// ─────────────────────────────────────────────
// 核心业务函数
// ─────────────────────────────────────────────

/**
 * 从数据库查询指定月份的所有排班，并转换为前端所需格式。
 *
 * 数据关系链：
 *   WorkSchedule (workDate, banTypeId)
 *     └─ BanType.banCode          ← 班次代码，如 "S1"
 *     └─ ScheduleAssignment[]
 *          └─ Person.name         ← 人员姓名
 *
 * 注：同一人在同一天可能被分配到不同班次（不同 banTypeId 的 WorkSchedule），
 * 若存在此情况，本函数以英文逗号拼接所有班次代码，如 "S1,S2"。
 */
async function getWorkSchedulebyMonth(
    year: number,
    month: number
): Promise<PersonScheduleEntry[]> {
    const {start, end} = getMonthRange(year, month);

    const workSchedules = await prisma.workSchedule.findMany({
        where: {
            workDate: {
                gte: start,
                lte: end,
            },
        },
        select: {
            workDate: true,
            banType: {
                select: {
                    banCode: true,
                },
            },
            scheduleAssignments: {
                select: {
                    person: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            workDate: "asc",
        },
    });

    // 中间结构：{ 人名 → { 日期 → 班次代码 } }
    const personMap: Record<string, PersonScheduleMap> = {};

    for (const schedule of workSchedules) {
        const dateStr = formatDate(schedule.workDate);
        const banCode = schedule.banType.banCode;

        for (const assignment of schedule.scheduleAssignments) {
            const personName = assignment.person.name;

            if (!personMap[personName]) {
                personMap[personName] = {};
            }

            // 同一天同一人若已有班次，则追加（实际业务中极少出现）
            const existing = personMap[personName][dateStr];
            personMap[personName][dateStr] = existing
                ? `${existing},${banCode}`
                : banCode;
        }
    }

    // 转换为与 simulateServer() 一致的数组格式
    return Object.entries(personMap).map(([personName, personData]) => ({
        [personName]: personData,
    }));
}

// ─────────────────────────────────────────────
// Next.js Route Handler
// ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
    // 1. 解析请求体
    let body: RequestBody;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            {success: false, error: "请求体不是有效的 JSON"},
            {status: 400}
        );
    }

    // 2. 参数校验
    const {year, month} = body;

    if (
        typeof year !== "number" ||
        typeof month !== "number" ||
        !Number.isInteger(year) ||
        !Number.isInteger(month) ||
        year < 2000 ||
        year > 2100 ||
        month < 1 ||
        month > 12
    ) {
        return NextResponse.json(
            {
                success: false,
                error: "参数错误：year 须为整数（2000-2100），month 须为 1-12 的整数",
            },
            {status: 400}
        );
    }

    // 3. 查询排班数据
    try {
        const data = await getWorkSchedulebyMonth(year, month);

        return NextResponse.json({success: true, data}, {status: 200});
    } catch (error) {
        console.error("[getWorkSchedulebyMonth] 数据库查询失败:", error);
        return NextResponse.json(
            {success: false, error: "服务器内部错误，获取排班信息失败"},
            {status: 500}
        );
    }
}
