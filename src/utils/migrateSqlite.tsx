import "dotenv/config";
import {sqlite} from "@/routers/sqlite";
import {prisma} from "@/routers/prisma";

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

migrateToVacationRule().catch(
    (reason) => {
        console.log(reason, 'xxyyzz')
    }
);