'use server';

import "dotenv/config";
import {prisma} from "@/connectionsDB/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {IPersonDateBansMap, TLeaveApplyType} from "@/components/tables/LeaveApplyList/NewLeaveApplyForm";
import {LeaveApplyStatus, LeaveApplyType} from "../../../prisma/generated/enums";

dayjs.extend(utc);

const leaveApplyTypeMap: Record<TLeaveApplyType, LeaveApplyType> = {
    '换班': 'SHIFT_SCHEDULE',
    '请假': 'ASKOFF',
    '改班': 'CHANGE_SCHEDULE',
}

export default async function createLeaveApply(leaveApplyType: TLeaveApplyType, start_date: string, end_date: string, reason: string,
                                               currentUser: string, targetStaff: string | null, LAAssignmentsJson: IPersonDateBansMap, status: LeaveApplyStatus) {
    const startDate = dayjs.utc(start_date).toDate();
    const endDate = dayjs.utc(end_date).toDate();
    const [currentUserPerson, targetStaffPerson] = await Promise.all([
        prisma.person.findUnique({where: {name: currentUser}}),
        targetStaff ? prisma.person.findUnique({where: {name: targetStaff}}) : null,
    ]);

    if (!currentUserPerson) {
        return;
    }

    return prisma.leaveApply.create({
        data: {
            leaveApplyType: leaveApplyTypeMap[leaveApplyType],
            startDate,
            endDate,
            reason,
            status,
            currentUserId: currentUserPerson?.id,
            targetStaffId: targetStaffPerson?.id ?? null,
            assignmentsJson: {...LAAssignmentsJson}
        }
    });
}