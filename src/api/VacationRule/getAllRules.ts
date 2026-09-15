'use server';

import "dotenv/config";
import {prisma} from "@/prisma/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {getPublishedWSIndexRecords} from "@/api/WorkSchedule/getWSbyNameDateBanName";

dayjs.extend(utc);

type WSIndexRecord = Awaited<ReturnType<typeof getPublishedWSIndexRecords>>[number];

function getWSIndexKey(name: string, banName: string) {
    return `${name}\u0000${banName}`;
}

function getDateTimestamp(date: Date) {
    return dayjs.utc(date).startOf('day').valueOf();
}

function lowerBound(values: number[], target: number) {
    let left = 0;
    let right = values.length;

    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (values[mid] < target) left = mid + 1;
        else right = mid;
    }

    return left;
}

function upperBound(values: number[], target: number) {
    let left = 0;
    let right = values.length;

    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (values[mid] <= target) left = mid + 1;
        else right = mid;
    }

    return left;
}

function buildWSDateIndex(records: WSIndexRecord[]) {
    const index = new Map<string, number[]>();

    records.forEach(record => {
        const name = record.person.name;
        const banName = record.workSchedule.banType.banName;
        const key = getWSIndexKey(name, banName);
        const dates = index.get(key) ?? [];

        dates.push(getDateTimestamp(record.workSchedule.workDate));
        index.set(key, dates);
    });

    index.forEach(dates => dates.sort((a, b) => a - b));
    return index;
}

function countWSByRange(index: Map<string, number[]>, name: string, banName: string, startDate: Date, endDate: Date) {
    const dates = index.get(getWSIndexKey(name, banName));
    if (!dates?.length) return 0;

    const start = getDateTimestamp(startDate);
    const end = getDateTimestamp(endDate);
    return upperBound(dates, end) - lowerBound(dates, start);
}

export default async function getAllRules(showHidden: boolean, isEditable: boolean, name?: string, need_lastJia: boolean = true) {
    const allVacationRules = await prisma.vacationRule.findMany({
        where: {
            ...(isEditable && !showHidden ? {isHidden: false} : {}),
            person: {
                isActive: true,
                ...(name ? {name} : {}),
            }
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
                    banName: true
                }
            }
        }
    });

    if (!allVacationRules.length) return [];

    const yearNameMap = new Map<string, { year: number; name: string }>();
    const nameSet = new Set<string>();
    const banNameSet = new Set<string>();

    allVacationRules.forEach(rule => {
        const year = dayjs.utc(rule.startDate).year();
        yearNameMap.set(`${year}\u0000${rule.person.name}`, {year, name: rule.person.name});
        nameSet.add(rule.person.name);
        banNameSet.add(rule.banType.banName);
    });

    if (!isEditable) {
        banNameSet.add('补假');
        banNameSet.add('调休假');
        if (need_lastJia) banNameSet.add('去年余假');
    }

    const ruleStartTime = Math.min(...allVacationRules.map(rule => getDateTimestamp(rule.startDate)));
    const ruleEndTime = Math.max(...allVacationRules.map(rule => getDateTimestamp(rule.endDate)));
    let queryStartTime = ruleStartTime;
    let queryEndTime = ruleEndTime;

    if (!isEditable) {
        const years = Array.from(yearNameMap.values(), item => item.year);
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        queryStartTime = Math.min(queryStartTime, dayjs.utc(`${minYear}-01-01`).valueOf());
        queryEndTime = Math.max(queryEndTime, dayjs.utc(`${maxYear}-12-31`).valueOf());
    }

    const WSRecords = await getPublishedWSIndexRecords(
        Array.from(nameSet),
        new Date(queryStartTime),
        new Date(queryEndTime),
        Array.from(banNameSet)
    );
    const WSDateIndex = buildWSDateIndex(WSRecords);

    const rulesWithStats: Array<typeof allVacationRules[number] & { left_days: number; used_days: number }> = allVacationRules.map(rule => {
        const used_days = countWSByRange(WSDateIndex, rule.person.name, rule.banType.banName, rule.startDate, rule.endDate);
        const left_days = rule.availableHalfDays / 2 - used_days;
        return {...rule, left_days, used_days};
    });

    if (isEditable) return rulesWithStats;

    let fake_rule_id = -1;
    const currentYear = dayjs().year();

    // 创建 调休假 所对应的规则
    for (const {year, name} of yearNameMap.values()) {
        const startDate = dayjs.utc(`${year}-01-01`).toDate();
        const endDate = dayjs.utc(`${year}-12-31`).toDate();
        const buJiaDays = countWSByRange(WSDateIndex, name, '补假', startDate, endDate);
        const used_days = countWSByRange(WSDateIndex, name, '调休假', startDate, endDate);
        const availableHalfDays = buJiaDays * 2;
        const left_days = availableHalfDays / 2 - used_days;
        const isHidden = year !== currentYear || left_days === 0;

        rulesWithStats.push({
            id: fake_rule_id--,
            startDate,
            endDate,
            availableHalfDays,
            isHidden,
            person: {name},
            banType: {banName: '调休假'},
            used_days,
            left_days
        });
    }

    if (!need_lastJia) return rulesWithStats.filter(rule => showHidden || !rule.isHidden);

    // 创建 去年余假 所对应的规则
    for (const {year, name} of yearNameMap.values()) {
        const startDate = dayjs.utc(`${year}-01-01`).toDate();
        const endDate = dayjs.utc(`${year}-01-31`).toDate();
        const availableHalfDays = rulesWithStats
            .filter(rule => dayjs.utc(rule.startDate).year() === year - 1 && rule.person.name === name)
            .reduce((sum, rule) => sum + rule.left_days, 0) * 2;
        const used_days = countWSByRange(WSDateIndex, name, '去年余假', startDate, endDate);
        const left_days = availableHalfDays / 2 - used_days;
        const isHidden = year !== currentYear || left_days === 0;

        if (!showHidden && isHidden) continue;

        rulesWithStats.push({
            id: fake_rule_id--,
            startDate,
            endDate,
            isHidden,
            person: {name},
            banType: {banName: '去年余假'},
            availableHalfDays,
            used_days,
            left_days
        });
    }

    return rulesWithStats.filter(rule => showHidden || !rule.isHidden);
}
