'use server';

import "dotenv/config";
import {prisma} from "@/prisma/prisma";
import dayjs, {Dayjs} from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

interface ICreateRules {
    names: string[];
    banName: string;
    start_date: string;
    end_date: string;
    availableHalfDays: number;
    isEnabled: boolean;
}

export default async function createRules({names, banName, start_date, end_date, availableHalfDays, isEnabled}: ICreateRules) {
    if (!names.length) return;

    const startDate = dayjs.utc(start_date);
    const endDate = dayjs.utc(end_date);

    const [banType, persons] = await Promise.all([
        prisma.banType.findUnique({
            where: {banName},
            select: {id: true}
        }),
        prisma.person.findMany({
            where: {
                name: {
                    in: names
                }
            },
            select: {
                id: true,
                name: true,
                hireDate: true
            }
        })
    ]);

    if (!banType) return;

    const personMap = new Map(persons.map(person => [person.name, person]));

    if (names.some(name => !personMap.has(name))) return;

    await prisma.vacationRule.createMany({
        data: names.map(name => {
            const person = personMap.get(name)!;

            return {
                startDate: startDate.toDate(),
                endDate: endDate.toDate(),
                availableHalfDays: banName === '年假'
                    ? computeAnnualLeaveDay(dayjs.utc(person.hireDate), endDate) * 2
                    : availableHalfDays,
                isHidden: !isEnabled,
                personId: person.id,
                banTypeId: banType.id
            };
        })
    });

    return 'ok';
}

function computeAnnualLeaveDay(hireDate: Dayjs, referenceDate: Dayjs) {
    const workYears = referenceDate.diff(hireDate, 'year');

    if (workYears < 1) return 0;
    if (workYears < 10) return 5;
    if (workYears < 20) return 10;

    return 15;
}
