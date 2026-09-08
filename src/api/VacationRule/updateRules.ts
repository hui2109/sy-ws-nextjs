'use server';

import {prisma} from "@/prisma/prisma";

export default async function updateRules(ruleIds: number[], isEnabled?: boolean, changeNum?: number) {
    const hasIsEnabled = isEnabled !== undefined;
    const hasChangeNum = changeNum !== undefined;

    // 必须且只能传一个修改参数
    if (hasIsEnabled === hasChangeNum) {
        throw new Error('isEnabled 和 changeNum 必须且只能传一个');
    }

    if (!ruleIds.length) {
        return;
    }

    await prisma.vacationRule.updateMany({
        where: {
            id: {
                in: ruleIds,
            },
        },
        data: hasIsEnabled
            ? {
                isHidden: !isEnabled,
            }
            : {
                availableHalfDays: {
                    increment: changeNum! * 2,
                },
            },
    });

    return 'ok';
}
