import {PersonDateBansMap} from "@/api/WorkSchedule/getWSbyMonth";
import dayjs, {Dayjs} from "dayjs";
import {getPeopleBadge, IBanTableRow} from "@/components/utils/getPeopleBadge";
import type {ColumnsType} from "antd/es/table";
import {Weekdays} from "@/configs/general";

export function getTransformTableData(dbData: PersonDateBansMap, current: Dayjs) {
    const {nameBansMap} = dbData;
    const dateSet = new Set<string>();
    const banDatePeopleMap: Record<string, Record<string, string[]>> = {};

    Object.keys(nameBansMap).forEach((personName) => {
        const dateMap = nameBansMap[personName];
        Object.keys(dateMap).forEach((date) => {
            dateSet.add(date);
            const banNames = dateMap[date];

            banNames.forEach((banName) => {
                if (!banDatePeopleMap[banName]) {
                    banDatePeopleMap[banName] = {};
                }
                if (!banDatePeopleMap[banName][date]) {
                    banDatePeopleMap[banName][date] = [];
                }
                banDatePeopleMap[banName][date].push(personName);
            });
        });
    });

    const sortedDateSet = Array.from(dateSet).sort();
    const sortedBanNames = Object.keys(banDatePeopleMap).sort();

    // 构建 dataSource
    const dataSource: IBanTableRow[] = sortedDateSet.map((date, index) => {
        const row: IBanTableRow = {
            key: String(index),
            date,
        };

        sortedBanNames.forEach((banName) => {
            row[banName] = banDatePeopleMap[banName]?.[date] || [];
        });

        return row;
    });

    // 构建 columns
    const columns: ColumnsType<IBanTableRow> = [
        {
            title: `${current.format('YYYY/M')}`,
            dataIndex: 'date',
            fixed: 'left',
            width: 60,
            render: (text: string) => {
                const currDate = dayjs(text);
                const xingqi = Weekdays[currDate.day()];
                return (
                    <div className='flex flex-col items-center justify-center gap-1 font-bold'>
                        <div>{currDate.date()}</div>
                        <div>{'(' + xingqi + ')'}</div>
                    </div>
                )
            },
        },
        ...sortedBanNames.map((banName) => ({
            title: banName,
            dataIndex: banName,
            render: (personNames: string[], record: IBanTableRow) => getPeopleBadge(personNames, record, banName),
        })),
    ];

    return {dataSource, columns};
}