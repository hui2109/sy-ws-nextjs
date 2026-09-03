'use server';

import "dotenv/config";
import {prisma} from "@/prisma/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {LeaveApplyStatus} from "@/prisma/generated/enums";
import {IPersonDateBansMap} from "@/components/tables/LeaveApplyTab/LeaveApplyFormNew";
import {LeaveApply} from "@/prisma/generated/client";
import getWSIdsbyIds from "@/api/ScheduleAssignment/getWSIdsbyIds";
import deleteScheduleAssignmentsbyIds from "@/api/ScheduleAssignment/deleteScheduleAssignmentsbyIds";
import createScheduleAssignmentbyIds from "@/api/ScheduleAssignment/createScheduleAssignmentbyIds";
import createScheduleAssignmentbyIdDateBanName from "@/api/ScheduleAssignment/createScheduleAssignmentbyIdDateBanName";
import {cleanWS} from "@/api/WorkSchedule/cleanWS";

dayjs.extend(utc);

export default async function updateLeaveApply(id: number, leaveApplyStatus: LeaveApplyStatus, rejectReason?: string) {
    const leaveApply = await prisma.leaveApply.findUnique({where: {id}});

    if (!leaveApply) return null;
    if (leaveApplyStatus === 'PENDING_REVIEW') {
        await prisma.leaveApply.updateMany({
            where: {
                id
            },
            data: {
                status: "PENDING_REVIEW"
            }
        });

        return null;
    }

    if (leaveApplyStatus === 'APPROVED') {
        const result = await executeLeaveApply(leaveApply);

        if (!result) {
            const error_message = "内部数据错误！之前提交的申请已经被通过，或被退回，或被修改，找不到已有数据！" as string;
            await prisma.leaveApply.updateMany({
                where: {
                    id
                },
                data: {
                    status: "PENDING_REVIEW",
                }
            });

            return error_message;
        }

        await prisma.leaveApply.updateMany({
            where: {
                id
            },
            data: {
                status: "APPROVED"
            }
        });

        return null;
    }

    if (!rejectReason) return null;
    if (leaveApplyStatus === 'REJECTED') {
        await prisma.leaveApply.updateMany({
            where: {
                id
            },
            data: {
                status: "REJECTED",
                reason: `【退回理由】${rejectReason.trim()}\n\n${leaveApply.reason}`,
            }
        });

        return null;
    }

    return null;
}

async function executeLeaveApply(leaveApply: LeaveApply) {
    const applyUser = await prisma.person.findUnique({where: {id: leaveApply.applyUserId}});
    const targetStaff = await prisma.person.findUnique({where: {id: leaveApply?.targetStaffId ?? -9999}});
    const startDate = dayjs(leaveApply.startDate);
    const endDate = dayjs(leaveApply.endDate);
    const assignmentsJson = leaveApply.assignmentsJson as IPersonDateBansMap;
    const actions = [];
    let hasInvalidData = false;

    if (!applyUser) return null;

    if (leaveApply.leaveApplyType === "SHIFT_SCHEDULE") {
        if (!targetStaff) return null;

        const applyUserDateBansMap = assignmentsJson[applyUser.name];
        const targetStaffDateBansMap = assignmentsJson[targetStaff.name];

        for (const [dt, banAssignment] of Object.entries(applyUserDateBansMap)) {
            if (dayjs(dt).isBefore(startDate, 'day') || dayjs(dt).isAfter(endDate, 'day')) continue;

            const applyUserScheduleAssignmentIds = banAssignment.map(([, id]) => id);
            const targetStaffScheduleAssignmentIds = targetStaffDateBansMap[dt].map(([, id]) => id);

            const applyUserWSIds = await getWSIdsbyIds(applyUserScheduleAssignmentIds);
            const targetStaffWSIds = await getWSIdsbyIds(targetStaffScheduleAssignmentIds);
            if (applyUserWSIds.some(value => value === null)) hasInvalidData = true;
            if (targetStaffWSIds.some(value => value === null)) hasInvalidData = true;

            if (!hasInvalidData) {
                actions.push(async () => {
                    await deleteScheduleAssignmentsbyIds([...applyUserScheduleAssignmentIds, ...targetStaffScheduleAssignmentIds]);

                    for (const applyUserWSId of applyUserWSIds) {
                        if (!applyUserWSId) return null;
                        await createScheduleAssignmentbyIds(targetStaff.id, applyUserWSId);
                    }

                    for (const targetStaffWSId of targetStaffWSIds) {
                        if (!targetStaffWSId) return null;
                        await createScheduleAssignmentbyIds(applyUser.id, targetStaffWSId);
                    }
                })
            }
        }
    }

    if (leaveApply.leaveApplyType === "ASKOFF") {
        const applyUserDateBansMap = assignmentsJson[applyUser.name];
        const applyUser_DateBansMap = assignmentsJson[`${applyUser.name}_`];

        for (const [dt, banAssignment] of Object.entries(applyUserDateBansMap)) {
            if (dayjs(dt).isBefore(startDate, 'day') || dayjs(dt).isAfter(endDate, 'day')) continue;

            const applyUserScheduleAssignmentIds = banAssignment.map(([, id]) => id);
            const applyUser_BanName = applyUser_DateBansMap[dt]?.[0][0] as string | undefined;

            if (!applyUser_BanName) continue;

            const applyUserWSIds = await getWSIdsbyIds(applyUserScheduleAssignmentIds);
            if (applyUserWSIds.some(value => value === null)) hasInvalidData = true;

            if (!hasInvalidData) {
                actions.push(async () => {
                    await deleteScheduleAssignmentsbyIds([...applyUserScheduleAssignmentIds]);

                    await createScheduleAssignmentbyIdDateBanName(applyUser.id, dt, applyUser_BanName);
                })
            }
        }
    }

    if (leaveApply.leaveApplyType === "CHANGE_SCHEDULE") {
        if (!targetStaff) return null;

        const targetStaffDateBansMap = assignmentsJson[targetStaff.name];
        const targetStaff_DateBansMap = assignmentsJson[`${targetStaff.name}_`];

        for (const [dt, banAssignment] of Object.entries(targetStaffDateBansMap)) {
            if (dayjs(dt).isBefore(startDate, 'day') || dayjs(dt).isAfter(endDate, 'day')) continue;

            const targetStaffScheduleAssignmentIds = banAssignment.map(([, id]) => id);
            const targetStaff_BanNames = targetStaff_DateBansMap[dt]?.map(([banName,]) => banName) as string[] | undefined;

            if (!targetStaff_BanNames || targetStaff_BanNames.length === 0) continue;

            const targetStaffWSIds = await getWSIdsbyIds(targetStaffScheduleAssignmentIds);
            if (targetStaffWSIds.some(value => value === null)) hasInvalidData = true;

            if (!hasInvalidData) {
                actions.push(async () => {
                    await deleteScheduleAssignmentsbyIds([...targetStaffScheduleAssignmentIds]);

                    for (const targetStaff_BanName of targetStaff_BanNames) {
                        await createScheduleAssignmentbyIdDateBanName(targetStaff.id, dt, targetStaff_BanName);
                    }
                })
            }
        }
    }

    if (hasInvalidData) return null;

    await Promise.all(actions.map(action => action()));
    // 清理多余的workSchedule
    await cleanWS();
    return 'ok';
}