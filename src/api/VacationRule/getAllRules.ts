'use server';

import "dotenv/config";
import {prisma} from "@/prisma/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {getWSbyNameDateBanName} from "@/api/WorkSchedule/getWSbyNameDateBanName";

dayjs.extend(utc);

export default async function getAllRules(showHidden: boolean, isEditable: boolean, name?: string, need_lastJia: boolean = true) {
    const allVacationRules = await prisma.vacationRule.findMany({
        where: {
            ...(name ? {person: {name}} : {})
        },
        select: {
            id: true,
            startDate: true,
            endDate: true,
            availableHalfDays: true,
            isHidden: true,
            person: {
                select: {
                    name: true
                }
            },
            banType: {
                select: {
                    banName: true,
                }
            }
        }
    });

    const rulesWithStats: Array<typeof allVacationRules[number] & { left_days: number; used_days: number }> = [];
    const yearNameSet = new Set<string>();
    let fake_rule_id = -1;

    // 先提取每个规则所对应的 年份&&姓名 所组成的不重复集合
    allVacationRules.forEach(rule => {
        yearNameSet.add(`${dayjs.utc(rule.startDate).year()}&&${rule.person.name}`)
    })

    // 获取已有规则所对应的 已使用天数 及 剩余天数
    for (const rule of allVacationRules) {
        const WSRecords = await getWSbyNameDateBanName(rule.person.name, rule.startDate, rule.endDate, rule.banType.banName);
        const used_days = WSRecords.length;
        const left_days = rule.availableHalfDays / 2 - WSRecords.length;

        rulesWithStats.push({...rule, left_days, used_days});
    }

    // 以下均是不可编辑的数据
    if (isEditable) return rulesWithStats.filter(rule => showHidden || !rule.isHidden);

    // 创建 调休假 所对应的规则
    for (const yearName of Array(...yearNameSet)) {
        const [year, name] = yearName.split('&&');

        const startDate = dayjs.utc(`${year}-01-01`).toDate();
        const endDate = dayjs.utc(`${year}-12-31`).toDate();
        const bu_jia = await getWSbyNameDateBanName(name, startDate, endDate, '补假');
        const tiao_xiu_jia = await getWSbyNameDateBanName(name, startDate, endDate, '调休假');

        const availableHalfDays = bu_jia.length * 2;
        const used_days = tiao_xiu_jia.length;
        const left_days = availableHalfDays / 2 - used_days;
        const isHidden = Number(year) !== dayjs().year() || left_days === 0;

        rulesWithStats.push({
            id: fake_rule_id,
            startDate,
            endDate,
            availableHalfDays,
            isHidden,
            person: {name},
            banType: {banName: '调休假'},
            used_days,
            left_days
        });
        fake_rule_id--;
    }

    // 不需要 去年余假 的情况下
    if (!need_lastJia) return rulesWithStats.filter(rule => showHidden || !rule.isHidden);

    // 创建 去年余假 所对应的规则
    for (const yearName of Array(...yearNameSet)) {
        const [year, name] = yearName.split('&&');

        const startDate = dayjs.utc(`${year}-01-01`).toDate();
        const endDate = dayjs.utc(`${year}-01-31`).toDate();
        const last_jia = await getWSbyNameDateBanName(name, startDate, endDate, '去年余假');

        const availableHalfDays = rulesWithStats
            .filter(rule => dayjs(rule.startDate).year() === (startDate.getFullYear() - 1) && rule.person.name === name)
            .reduce((sum, rule) => sum + rule.left_days, 0) * 2;
        const used_days = last_jia.length;
        const left_days = availableHalfDays / 2 - used_days;
        const isHidden = Number(year) !== dayjs().year() || left_days === 0;

        if (!showHidden && isHidden) continue;

        rulesWithStats.push({
            id: fake_rule_id,
            startDate,
            endDate,
            isHidden,
            person: {name},
            banType: {banName: '去年余假'},
            availableHalfDays,
            used_days,
            left_days
        });
        fake_rule_id--;
    }

    return rulesWithStats.filter(rule => showHidden || !rule.isHidden);
}

// npx tsx src/api/VacationRule/getAllRules.ts
// getAllRules(true).then((rules) => {
//     console.log(rules);
// });