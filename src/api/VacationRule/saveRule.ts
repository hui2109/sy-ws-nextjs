'use server';

import "dotenv/config";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {IRuleData} from "@/components/tables/HolidaySettingTable/useHSTableData";
import {prisma} from "@/connectionsDB/prisma";

dayjs.extend(utc);

export default async function saveRule(rule: IRuleData) {
    const startDate = dayjs.utc(rule.startDate).toDate();
    const endDate = dayjs.utc(rule.endDate).toDate();

    try {
        await prisma.vacationRule.upsert({
            where: {
                id: rule.id
            },
            create: {
                startDate,
                endDate,
                availableHalfDays: rule.available_days * 2,
                isHidden: !rule.enabled,
                person: {connect: {name: rule.name}},
                banType: {connect: {banName: rule.banName}},
            },
            update: {
                startDate,
                endDate,
                availableHalfDays: rule.available_days * 2,
                isHidden: !rule.enabled,
                person: {connect: {name: rule.name}},
                banType: {connect: {banName: rule.banName}}
            }
        });
        return 'ok';
    } catch (error) {
        const message = String(error);
        if (message.indexOf('Unique constraint') !== -1) {
            return 'Unique constraint';
        }
        return String(error);
    }
}