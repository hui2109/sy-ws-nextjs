import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/connectionsDB/prisma";
import dayjs, {Dayjs} from "dayjs";

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

    for (const schedule of workSchedules) {
        const dateString: string = dayjs(schedule.workDate).format("YYYY-MM-DD");
        const banName = schedule.banType.banName;

        for (const assignment of schedule.scheduleAssignments) {
            const personName = assignment.person.name;

            if (!MonthSchedule[personName]) {
                MonthSchedule[personName] = {};
            }

            if (!MonthSchedule[personName][dateString]) {
                MonthSchedule[personName][dateString] = [];
            }
            MonthSchedule[personName][dateString].push(banName);
        }
    }

    return MonthSchedule
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    try {
        const data = await queryDB(dayjs(body));
        return NextResponse.json({success: true, data}, {status: 200});
    } catch (error) {
        console.error(error);
        return NextResponse.json({success: false, error: "getWSbyMonth 失败!"}, {status: 500}
        );
    }
}
