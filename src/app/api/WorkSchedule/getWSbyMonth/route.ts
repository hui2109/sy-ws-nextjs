import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/connectionsDB/prisma";
import dayjs, {Dayjs} from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

// {'叶荣': {'2026-06-01': ['S1'], '2026-06-02': ['S1', 'JD']}}
type PersonDateBansMap = Record<string, Record<string, string[]>>;

async function queryDB(date: Dayjs): Promise<PersonDateBansMap> {
    const workSchedules = await prisma.workSchedule.findMany({
        where: {
            workDate: {
                gte: date.startOf('month').toDate(),
                lte: date.endOf('month').toDate(),
            },
        },
        select: {
            workDate: true,
            banType: {
                select: {
                    banName: true,
                },
            },
            scheduleAssignments: {
                select: {
                    person: {
                        select: {
                            name: true,
                            displayOrder: true
                        },
                    },
                },
            },
        },
        orderBy: {
            workDate: "asc",
        },
    });

    const MonthSchedule: PersonDateBansMap = {};
    const orderMap = new Map<string, number>();  // 记录每个人的 displayOrder

    for (const schedule of workSchedules) {
        const dateString: string = dayjs.utc(schedule.workDate).format("YYYY-MM-DD");
        const banName = schedule.banType.banName;

        for (const {person} of schedule.scheduleAssignments) {
            orderMap.set(person.name, person.displayOrder);  // ← 顺手记录

            if (!MonthSchedule[person.name]) MonthSchedule[person.name] = {};
            if (!MonthSchedule[person.name][dateString]) MonthSchedule[person.name][dateString] = [];
            MonthSchedule[person.name][dateString].push(banName);
        }
    }

    // 按 displayOrder 重建对象
    return Object.fromEntries(
        [...orderMap.entries()]
            .sort(([, a], [, b]) => a - b)
            .map(([name]) => [name, MonthSchedule[name]])
    );
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    try {
        const data = await queryDB(dayjs.utc(body));
        return NextResponse.json({success: true, data}, {status: 200});
    } catch (error) {
        console.error(error);
        return NextResponse.json({success: false, error: "getWSbyMonth 失败!"}, {status: 500}
        );
    }
}
