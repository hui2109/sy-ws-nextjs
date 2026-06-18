import {Dayjs} from "dayjs";
import {Badge, TableColumnsType} from "antd";
import {getWSbyMonth} from "../WorkSchedule/getWSbyMonth";
import {getBanTypeColorMap} from "../BanType/getBanTypeColorMap";
import {LatterBantype, Weekdays} from "@/configs/general";

export interface IScheduleTableData {
    dataSource: { key: string, name: string, [date: string]: string[] | string }[];
    columns: TableColumnsType;
}

export async function getScheduleTableData(date: Dayjs): Promise<IScheduleTableData> {
    const dbData = await getWSbyMonth(date.format('YYYY-MM-DD'));
    const banTypeColorMap = await getBanTypeColorMap();
    const dataSource = Object.entries(dbData).map(([personName, scheduleInfo]) => {
        const rowData: { key: string, name: string, [date: string]: string[] | string } = {
            key: personName,
            name: personName,
        };

        for (const [string_date, bansList] of Object.entries(scheduleInfo)) {
            rowData[string_date] = sortBanTypeList(bansList);
        }

        return rowData;
    });

    return {
        dataSource,
        columns: getColumns(date, banTypeColorMap)
    }
}

function getColumns(date: Dayjs, banTypeColorMap: Record<string, string>): TableColumnsType {
    const daysInMonth = Array.from(
        {length: date.daysInMonth()},
        (_, i) => date.date(i + 1)
    );

    const columns: TableColumnsType = daysInMonth.map(day => {
        const index = day.format('YYYY-MM-DD');
        return {
            title: (
                <div className='flex flex-col items-center font-bold'>
                    <span>{Weekdays[day.day()]}</span>
                    <span>{day.date()}</span>
                </div>
            ),
            dataIndex: index,
            render: (text?: Array<string>) => {
                if (!text) return (
                    <div className="italic text-gray-300">null</div>
                );

                return (
                    <div className='flex flex-col justify-center items-center gap-1'>
                        {text.map(banType => (
                                <Badge
                                    key={banType}
                                    count={banType}
                                    color={banTypeColorMap[banType]}
                                    classNames={{indicator: '!rounded-lg !font-bold'}}
                                />
                            )
                        )}
                    </div>
                )
            },
            onCell: (record) => ({
                style: {cursor: 'pointer'},
                onClick: () => {
                    console.log(record.name, day, record[index])
                }
            })
        }
    });
    columns.unshift({
        title: (
            <div className='font-bold text-green-600'>
                已发布
            </div>
        ),
        dataIndex: "name",
        fixed: 'start',
        width: 80,
        render: (text) => {
            return (
                <div className='font-bold'>
                    {text}
                </div>
            )
        }
    });
    return columns;
}

function sortBanTypeList(bansList: string[]): string[] {
    const latterBanTypeOrder = new Map<string, number>(
        LatterBantype.map((item, index) => [item, index])
    );
    const normalList: string[] = [];
    const latterList: string[] = [];

    bansList.forEach((item) => {
        if (latterBanTypeOrder.has(item)) {
            latterList.push(item);
        } else {
            normalList.push(item);
        }
    });

    latterList.sort((a, b) => {
        return latterBanTypeOrder.get(a)! - latterBanTypeOrder.get(b)!;
    });

    return [...normalList, ...latterList];
}