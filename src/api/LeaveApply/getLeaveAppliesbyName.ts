'use server';

import "dotenv/config";
import {prisma} from "@/connectionsDB/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {ILeaveApplyRecord} from "@/components/tables/LeaveApplyTab/LeaveApplyList";
import {IPersonDateBansMap} from "@/components/tables/LeaveApplyTab/LeaveApplyFormNew";

dayjs.extend(utc);

export default async function getLeaveAppliesbyName(currentUser: string) {
    const leaveApplies = await prisma.leaveApply.findMany({
        where: {
            OR: [
                {
                    currentUser: {
                        name: currentUser,
                    },
                },
                {
                    targetStaff: {
                        name: currentUser,
                    },
                },
            ],
        },
        select: {
            leaveApplyType: true,
            currentUser: {
                select: {
                    name: true
                }
            },
            targetStaff: {
                select: {
                    name: true
                }
            },
            startDate: true,
            endDate: true,
            createdAt: true,
            status: true,
            reason: true,
            assignmentsJson: true
        },
        orderBy: {
            createdAt: 'desc',
        }
    });

    return leaveApplies.map((leaveApply): ILeaveApplyRecord => ({
        leaveApplyType: leaveApply.leaveApplyType,
        currentUser: leaveApply.currentUser.name,
        targetStaff: leaveApply?.targetStaff?.name ?? 'XXX',
        start_date: dayjs.utc(leaveApply.startDate).format('YYYY-MM-DD'),
        end_date: dayjs.utc(leaveApply.endDate).format('YYYY-MM-DD'),
        created_date: dayjs(leaveApply.createdAt).toISOString(),
        status: leaveApply.status,
        reason: leaveApply.reason,
        assignmentsJson: leaveApply.assignmentsJson as IPersonDateBansMap
    }))
}

// npx tsx src/api/LeaveApply/getLeaveAppliesbyName.ts
getLeaveAppliesbyName('张旭辉').then(r => console.log(r));
