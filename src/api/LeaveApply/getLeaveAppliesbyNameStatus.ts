'use server';

import 'dotenv/config';
import {prisma} from '@/connectionsDB/prisma';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {ILeaveApplyRecord} from '@/components/tables/LeaveApplyTab/LeaveApplyList';
import {IPersonDateBansMap} from '@/components/tables/LeaveApplyTab/LeaveApplyFormNew';
import {SendStatus} from '@/components/tables/LeaveApplyTab/LeaveApplyTab';
import {LeaveApplyType} from '@/prisma/generated/enums';
import {Prisma} from '@/prisma/generated/client';

dayjs.extend(utc);

export default async function getLeaveAppliesbyNameStatus(name: string, sendStatus: SendStatus) {
    const person = await prisma.person.findUnique({where: {name}});

    if (!person) return null;

    let where: Prisma.LeaveApplyWhereInput;

    if (sendStatus === 'Sent') {
        // 我发出的申请
        where = {
            currentUser: {
                name,
            },
        };
    } else if (person.role === 'USER') {
        // 普通用户收到的申请
        where = {
            targetStaff: {
                name,
            },
        };
    } else {
        // 非普通用户：
        // 1. 发给自己的申请
        // 2. 所有非换班申请
        where = {
            OR: [
                {
                    targetStaff: {
                        name,
                    },
                },
                {
                    leaveApplyType: {
                        not: LeaveApplyType.SHIFT_SCHEDULE,
                    },
                },
            ],
        };
    }

    const leaveApplies = await prisma.leaveApply.findMany({
        where,
        select: {
            leaveApplyType: true,
            currentUser: {
                select: {
                    name: true,
                },
            },
            targetStaff: {
                select: {
                    name: true,
                },
            },
            startDate: true,
            endDate: true,
            createdAt: true,
            status: true,
            reason: true,
            assignmentsJson: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return leaveApplies.map(
        (leaveApply): ILeaveApplyRecord => ({
            leaveApplyType: leaveApply.leaveApplyType,
            currentUser: leaveApply.currentUser.name,
            targetStaff: leaveApply.targetStaff?.name ?? 'XXX',
            start_date: dayjs.utc(leaveApply.startDate).format('YYYY-MM-DD'),
            end_date: dayjs.utc(leaveApply.endDate).format('YYYY-MM-DD'),
            created_date: dayjs(leaveApply.createdAt).toISOString(),
            status: leaveApply.status,
            reason: leaveApply.reason,
            assignmentsJson:
                leaveApply.assignmentsJson as unknown as IPersonDateBansMap,
        }),
    );
}
