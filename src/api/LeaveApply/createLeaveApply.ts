'use server';

import "dotenv/config";
import {prisma} from "@/prisma/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {IPersonDateBansMap} from "@/components/tables/LeaveApplyTab/LeaveApplyFormNew";
import {LeaveApplyStatus, LeaveApplyType} from "@/prisma/generated/enums";

dayjs.extend(utc);

export default async function createLeaveApply(leaveApplyType: LeaveApplyType, start_date: string, end_date: string, reason: string,
                                               applyUser: string, targetStaff: string | null, LAAssignmentsJson: IPersonDateBansMap, status: LeaveApplyStatus) {
    const startDate = dayjs.utc(start_date).toDate();
    const endDate = dayjs.utc(end_date).toDate();
    const [applyUserPerson, targetStaffPerson] = await Promise.all([
        prisma.person.findUnique({where: {name: applyUser}}),
        targetStaff ? prisma.person.findUnique({where: {name: targetStaff}}) : null,
    ]);

    if (!applyUserPerson) {
        return;
    }

    return prisma.leaveApply.create({
        data: {
            leaveApplyType,
            startDate,
            endDate,
            reason,
            status,
            applyUserId: applyUserPerson?.id,
            targetStaffId: targetStaffPerson?.id ?? null,
            assignmentsJson: {...LAAssignmentsJson}
        }
    });
}