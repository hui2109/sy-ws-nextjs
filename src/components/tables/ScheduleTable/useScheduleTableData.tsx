import React, {useEffect, useMemo, useState} from "react";
import {Badge, TableColumnsType} from "antd";
import {LatterBantype, ScheduleStatus, Weekdays} from "@/configs/general";
import {Dayjs} from "dayjs";
import {getWSbyMonth} from "@/api/WorkSchedule/getWSbyMonth";
import {getBanTypeColorMap} from "@/api/BanType/getBanTypeColorMap";
import NullText from "@/components/utils/NullText";

export interface IScheduleTableTools {
    autoSchedule: boolean;
    showPrevMonth: boolean;
    eraser: boolean;
}

export interface IScheduleTableData {
    dataSource: { key: string; name: string; [date: string]: string[] | string }[];
    columns: TableColumnsType;
    loading: boolean;
}

export interface IScheduleCellInfo {
    name: string;
    day: Dayjs;
    bans: string[] | undefined;
}

type AsyncState = {
    dbDataCurr: Awaited<ReturnType<typeof getWSbyMonth>>;
    dbDataPrev: Awaited<ReturnType<typeof getWSbyMonth>> | null;
    banTypeColorMap: Record<string, string>;
};

export default function useScheduleTableData(
    currDate: Dayjs,
    refreshKey: number,
    stToolStatus: IScheduleTableTools,
    onCellClick: (info: IScheduleCellInfo) => void
): IScheduleTableData {
    const [asyncState, setAsyncState] = useState<AsyncState | null>(null);
    const [loading, setLoading] = useState(true);

    // ✅ Effect 1：只管当月数据，showPrevMonth 变化时完全不触发
    useEffect(() => {
        let isMounted = true;
        const formatCurrDate = currDate.format('YYYY-MM-DD');

        Promise.all([
            getWSbyMonth(formatCurrDate),
            getBanTypeColorMap(),
        ]).then(([dbDataCurr, banTypeColorMap]) => {
            if (isMounted) {
                setAsyncState(prev => ({...prev, dbDataCurr, banTypeColorMap, dbDataPrev: prev?.dbDataPrev ?? null}));
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            setLoading(true);
        };
    }, [currDate, refreshKey]);

    // ✅ Effect 2：只管上月数据，当月数据变化时不重新请求上月
    useEffect(() => {
        if (!stToolStatus.showPrevMonth) {
            return;
        }

        let isMounted = true;
        const formatPrevDate = currDate.subtract(1, 'month').format('YYYY-MM-DD');

        getWSbyMonth(formatPrevDate).then(dbDataPrev => {
            if (isMounted) {
                setAsyncState(prev => prev ? {...prev, dbDataPrev} : null);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [currDate, stToolStatus.showPrevMonth]);

    const nameBansMap = asyncState?.dbDataCurr?.nameBansMap;
    const dataSource = useMemo(() => {
        if (!nameBansMap) return [];
        return Object.entries(nameBansMap).map(([personName, scheduleInfo]) => {
            const rowData: { key: string; name: string; [date: string]: string[] | string } = {
                key: personName,
                name: personName,
            };
            for (const [string_date, bansList] of Object.entries(scheduleInfo)) {
                rowData[string_date] = sortBanTypeList(bansList);
            }
            return rowData;
        });
    }, [nameBansMap]);

    if (!asyncState) {
        return {dataSource, columns: [], loading};
    }

    const {dbDataCurr, dbDataPrev, banTypeColorMap} = asyncState;
    const {monthStatus} = dbDataCurr;
    const effectiveDbDataPrev = stToolStatus.showPrevMonth ? dbDataPrev : null;
    const columns = getColumns(currDate, monthStatus, banTypeColorMap, effectiveDbDataPrev, onCellClick);

    return {dataSource, columns, loading};
}

function getColumns(
    date: Dayjs,
    monthStatus: string,
    banTypeColorMap: Record<string, string>,
    dbDataPrev: AsyncState['dbDataPrev'],
    onCellClick: (info: IScheduleCellInfo) => void
): TableColumnsType {
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
            render: (text: Array<string> | undefined, record) => {
                if (!text) {
                    if (!dbDataPrev) {
                        // 证明不是 显示上周期 的模式
                        return <NullText/>
                    }
                    const {nameBansMap} = dbDataPrev;
                    const banList = nameBansMap[record.name][currDateToPreDate(day)];

                    if (!banList) {
                        return <NullText/>;
                    }
                    return (
                        <div className='flex flex-col justify-center items-center gap-1'>
                            {banList.map(banType => (
                                <NullText
                                    key={banType}
                                    text={banType}
                                />
                            ))}
                        </div>
                    )

                }

                return (
                    <div className='flex flex-col justify-center items-center gap-1'>
                        {text.map(banType => (
                            <Badge
                                key={banType}
                                count={banType}
                                color={banTypeColorMap[banType]}
                                classNames={{indicator: '!rounded-lg !font-bold'}}
                            />
                        ))}
                    </div>
                );
            },
            onCell: (record) => ({
                style: {cursor: 'pointer'},
                onClick: () => {
                    onCellClick({
                        name: record.name,
                        day,
                        bans: record[index] ?? [],
                    });
                },
            }),
        };
    });

    columns.unshift({
        title: getMonthStatusBadge(monthStatus),
        dataIndex: 'name',
        fixed: 'start',
        width: 80,
        render: (text) => (
            <div className='font-bold'>{text}</div>
        ),
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

    latterList.sort((a, b) => latterBanTypeOrder.get(a)! - latterBanTypeOrder.get(b)!);

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

function currDateToPreDate(currDate: Dayjs): string {
    const preDate = currDate.subtract(1, 'month');
    const daysLeft = currDate.date() - currDate.startOf('month').date();
    return preDate.endOf('month').subtract(daysLeft, 'day').format('YYYY-MM-DD');
}
