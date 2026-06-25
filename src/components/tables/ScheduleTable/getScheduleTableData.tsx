import {Badge, TableColumnsType} from "antd";
import {LatterBantype, ScheduleStatus, Weekdays} from "@/configs/general";
import {Dayjs} from "dayjs";
import {getWSbyMonth} from "@/api/WorkSchedule/getWSbyMonth";
import {getBanTypeColorMap} from "@/api/BanType/getBanTypeColorMap";
import NullText from "@/components/utils/NullText";

export interface IScheduleTableData {
    dataSource: { key: string, name: string, [date: string]: string[] | string }[];
    columns: TableColumnsType;
}

export interface IScheduleCellInfo {
    name: string;
    day: Dayjs;
    bans: string[] | undefined;
}

export async function getScheduleTableData(date: Dayjs, onCellClick?: (info: IScheduleCellInfo) => void): Promise<IScheduleTableData> {
    const dbData = await getWSbyMonth(date.format('YYYY-MM-DD'));
    const banTypeColorMap = await getBanTypeColorMap();
    const {monthStatus, ...personRecord} = dbData;

    const dataSource = Object.entries(personRecord).map(([personName, scheduleInfo]) => {
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
        columns: getColumns(date, monthStatus, banTypeColorMap, onCellClick)
    }
}

function getColumns(date: Dayjs, monthStatus: string, banTypeColorMap: Record<string, string>, onCellClick?: (info: IScheduleCellInfo) => void): TableColumnsType {
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
                if (!text) return <NullText/>;

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
                    // console.log(record.name, day, record[index]);
                    onCellClick?.({
                        name: record.name,
                        day,
                        bans: record[index]
                    });
                }
            })
        }
    });
    columns.unshift({
        title: getMonthStatusBadge(monthStatus),
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

function getMonthStatusBadge(monthStatus: string) {
    const monthStatusColorMap: Record<string, string> = {
        [ScheduleStatus.DRAFT]: '#f5222d',
        [ScheduleStatus.PENDING_REVIEW]: '#faad14',
        [ScheduleStatus.PUBLISHED]: '#52c41a',
    };

    return (
        <Badge
            count={monthStatus}
            color={monthStatusColorMap[monthStatus] ?? 'blue'}
            classNames={{indicator: '!rounded-lg !font-bold !text-[14px]'}}
            size='medium'
        />
    );
}