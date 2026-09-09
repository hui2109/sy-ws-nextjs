'use server';

import "dotenv/config";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import getAllRules from "@/api/VacationRule/getAllRules";
import {getBanTypeColorMap} from "@/api/BanType/getBanTypeColorMap";

dayjs.extend(utc);

export default async function getRemainDaysbyNameDate(name: string, current_date: string) {
    const date = dayjs.utc(current_date);
    const banNameRemainDaysMap: { key: string, days: number, color: string }[] = [];
    // 只有每年的一月份才会计算 去年余假
    const need_lastJia = date.isAfter(dayjs(`${date.year()}-01-01`)) && date.isBefore(dayjs(`${date.year()}-01-31`));

    const banTypeColorMap = await getBanTypeColorMap();
    const validVacationRules = await getAllRules(false, false, name, need_lastJia);

    for (const rule of validVacationRules) {
        banNameRemainDaysMap.push({key: rule.banType.banName, days: rule.left_days, color: banTypeColorMap[rule.banType.banName]});
    }

    return banNameRemainDaysMap;
}

// npx tsx src/api/VacationRule/getRemainDaysbyNameDate.ts
// getRemainDaysbyNameDate('张旭辉', '2026-01-25').then(r => console.log(r));