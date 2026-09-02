'use server';

import "dotenv/config";
import {prisma} from "@/prisma/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {LeaveApplyStatus} from "@/prisma/generated/enums";

dayjs.extend(utc);

export default async function updateLeaveApply(id: number, leaveApplyStatus: LeaveApplyStatus, rejectReason?: string) {
    const leaveApply = await prisma.leaveApply.findUnique({where: {id}, select: {reason: true}});

    if (!leaveApply) return null;
    if (leaveApplyStatus === 'DRAFT') {
        await prisma.leaveApply.updateMany({
            where: {
                id
            },
            data: {
                status: "PENDING_REVIEW"
            }
        })

        return null;
    }

    if (leaveApplyStatus === 'APPROVED') {
        await prisma.leaveApply.updateMany({
            where: {
                id
            },
            data: {
                status: "APPROVED"
            }
        })

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
        })

        return null;
    }

    return null;
}