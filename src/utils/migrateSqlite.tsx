import "dotenv/config";
import {sqlite} from "@/connectionsDB/sqlite";
import {prisma} from "@/connectionsDB/prisma";

// npx tsx src/utils/migrateSqlite.tsx

function parseSqliteTime(value: string) {
    const [hour, minute, secondPart = "0"] = value.split(":");
    const second = secondPart.split(".")[0];

    return new Date(Date.UTC(
        1970,
        0,
        1,
        Number(hour),
        Number(minute),
        Number(second),
    ));
}

function getBanTypeColor() {
    return {
        'NA': '#e9ecef',

        // 1系列班次（蓝色系 - 适中饱和度）
        '1A': '#5b9bd5',
        '1B': '#4472c4',
        '1C': '#2f5597',

        // 2系列班次（绿色系 - 适中饱和度）
        '2A': '#70ad47',
        '2B': '#548235',
        '2C': '#375623',

        // 3系列班次（粉色系 - 适中饱和度）
        '3A': '#b85798',
        '3B': '#9a4480',
        '3C': '#7c3168',

        // S系列班次（橙色系 - 适中饱和度）
        'S1': '#d97532',
        'S2': '#c65911',
        'S2-A': '#e0812e',
        'S2-B': '#8f3f0d',

        // N系列夜班（紫色系 - 适中饱和度）
        'N1': '#8e44ad',
        'N2': '#7d3c98',

        // 培训相关（棕色系 - 适中饱和度）
        '进修': '#bf9000',
        '培训': '#a67c00',
        '机动': '#8d6700',

        // 休息（淡灰色系）
        '休息': '#adb5bd',

        // 休假类（鲜艳突出色系）
        '放射假': '#0d6efd',
        '年假': '#198754',
        '病假': '#fd7e14',
        '事假': '#ffc107',
        '婚假': '#d63384',
        '产假': '#dc3545',
        '陪产假': '#6610f2',
        '育儿假': '#0dcaf0',
        '丧假': '#6c757d',
        '补假': '#20c997',
        '调休假': '#ee4e09',
        '其他假': '#e83e8c',

        // 加班类（红色系 - 适中饱和度）
        'OAE': '#d63384',
        'OBE': '#c2185b',
        'OCE': '#ad1457',
        'OAF': '#e91e63',
        'OBF': '#f06292',
        'OCF': '#f8bbd9',

        // 实习班
        'T1A': '#ba68c8',  // 淡紫色
        'T1B': '#ab47bc',  // 稍深
        'T2A': '#9c27b0',  // 标准紫色
        'T2B': '#8e24aa',  // 原色
        'T3A': '#7b1fa2',  // 深紫
        'T3B': '#6a1b9a',  // 更深
        'TS1': '#4a148c',  // 深夜紫
        'TS2': '#311b92',  // 蓝紫
        'PHY': '#ff7043'   // 橙色系偏亮
    };
}


async function migrateToPerson() {
    const personnel = sqlite
        .prepare("SELECT * FROM personnel JOIN account ON personnel.account_id = account.id")
        .all();

    for (const person of personnel) {
        const {id, name, weight, hiredate, worknumber, phonenumber, username, password, avatar} = person as never;

        await prisma.person.create({
            data: {
                id,
                name,
                weight,
                hireDate: new Date(`${hiredate}T00:00:00.000Z`),
                workNumber: worknumber,
                phoneNumber: phonenumber,
                username,
                passwordHash: password,
                avatar,
            },
        });
    }
}

async function migrateToBanType() {
    const bantypes = sqlite
        .prepare("SELECT * FROM bantype")
        .all();

    for (const bantype of bantypes) {
        const {id, ban, start_time, end_time, description} = bantype as never;

        await prisma.banType.create({
            data: {
                id,
                banCode: ban,
                banName: '哈哈',  // banName自己手动改
                startTime: parseSqliteTime(start_time),
                endTime: parseSqliteTime(end_time),
                description,
            },
        });
    }
}

async function migreateToWorkSchedule() {
    const workSchedules = sqlite
        .prepare("SELECT * FROM workschedule")
        .all();

    for (const workSchedule of workSchedules) {
        const {id, work_date, bantype_id, status} = workSchedule as never;

        await prisma.workSchedule.create({
            data: {
                id,
                workDate: new Date(`${work_date}T00:00:00.000Z`),
                status: status,
                banTypeId: bantype_id,
            }
        })
    }
}

async function migrateToWPL() {
    const wpls = sqlite
        .prepare("SELECT * FROM workschedulepersonnellink")
        .all();

    for (const wpl of wpls) {
        const {workschedule_id, personnel_id} = wpl as never;

        await prisma.scheduleAssignment.create({
            data: {
                workScheduleId: workschedule_id,
                personId: personnel_id,
            },
        });
    }
}

async function migrateToLeaveAppointment() {
    const leaveAppointments = sqlite
        .prepare("SELECT * FROM reservevacation")
        .all();

    for (const leaveAppointment of leaveAppointments) {
        const {id, sequence, reserve_date, bantype_id, personnel_id} = leaveAppointment as never;

        await prisma.leaveAppointment.create({
            data: {
                id,
                sequenceNumber: sequence,
                appointmentDate: new Date(`${reserve_date}T00:00:00.000Z`),
                personId: personnel_id,
                banTypeId: bantype_id
            },
        });
    }
}

async function migrateToVacationRule() {
    const vacationRules = sqlite
        .prepare("SELECT * FROM restinfo")
        .all();

    for (const vacationRule of vacationRules) {
        const {id, start_date, end_date, available_days, personnel_id, bantype_id, is_deleted} = vacationRule as never;

        await prisma.vacationRule.create({
            data: {
                id,
                startDate: new Date(`${start_date}T00:00:00.000Z`),
                endDate: new Date(`${end_date}T00:00:00.000Z`),
                availableHalfDays: available_days * 2,
                isHidden: is_deleted === 1,
                personId: personnel_id,
                banTypeId: bantype_id,
            },
        });
    }
}

async function migrateToBanTypeColor() {
    const banTypeColorMap = getBanTypeColor();
    const allBanTypes = await prisma.banType.findMany({
        select: {id: true, banName: true},
    });

    for (const banType of allBanTypes) {
        const color = banTypeColorMap[banType.banName as keyof typeof banTypeColorMap];
        if (color) {
            await prisma.banType.update({
                where: {id: banType.id},
                data: {color},
            });
        }
    }
}

// migreateToWorkSchedule();
// migrateToWPL();