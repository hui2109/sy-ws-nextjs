import React, {useContext, useEffect, useMemo, useState} from "react";
import {Badge, TableColumnsType} from "antd";
import {LatterBantype, ScheduleStatus, Weekdays} from "@/configs/general";
import {Dayjs} from "dayjs";
import {getWSbyMonth} from "@/api/WorkSchedule/getWSbyMonth";
import {getBanTypeColorMap} from "@/api/BanType/getBanTypeColorMap";
import NullText from "@/components/utils/NullText";
import {deleteWSRecord} from "@/api/WorkSchedule/deleteWSRecord";
import {useMenuContext} from "@/components/hooks/MenuContext";
import {NotificationInstance} from "antd/es/notification/interface";
import {CurrentDateContext} from "@/components/hooks/CurrentDateContext";

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
    stToolStatus: IScheduleTableTools,
    onCellClick: (info: IScheduleCellInfo) => void
): IScheduleTableData {
    const {current, refreshKey, refresh} = useContext(CurrentDateContext);
    const [asyncState, setAsyncState] = useState<AsyncState | null>(null);
    const [loading, setLoading] = useState(true);
    const {notification} = useMenuContext();

    // ✅ Effect 1：只管当月数据，showPrevMonth 变化时完全不触发
    useEffect(() => {
        let isMounted = true;
        const formatCurrDate = current.format('YYYY-MM-DD');

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
    }, [current, refreshKey]);

    // ✅ Effect 2：只管上月数据，当月数据变化时不重新请求上月
    useEffect(() => {
        if (!stToolStatus.showPrevMonth) {
            return;
        }

        let isMounted = true;
        const formatPrevDate = current.subtract(1, 'month').format('YYYY-MM-DD');

        getWSbyMonth(formatPrevDate).then(dbDataPrev => {
            if (isMounted) {
                setAsyncState(prev => prev ? {...prev, dbDataPrev} : null);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [current, stToolStatus.showPrevMonth]);

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
    const columns = getColumns(current, monthStatus, banTypeColorMap, effectiveDbDataPrev, stToolStatus.eraser, notification, refresh, onCellClick);

    return {dataSource, columns, loading};
}

function getColumns(
    date: Dayjs,
    monthStatus: string,
    banTypeColorMap: Record<string, string>,
    effectiveDbDataPrev: AsyncState['dbDataPrev'],
    eraser: boolean,
    notification: NotificationInstance,
    refresh: () => void,
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
                    if (!effectiveDbDataPrev) {
                        // 证明不是 显示上周期 的模式
                        return <NullText/>
                    }
                    const {nameBansMap} = effectiveDbDataPrev;
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
                    if (eraser) {
                        // 橡皮擦模式: 点击单元格, 直接清空单元格里的所有排程
                        if (record[index]) {
                            const banList: Array<string> = record[index];
                            banList.forEach((banName, i) =>
                                deleteWSRecord(index, banName, record.name).then(() => {
                                    if (i === banList.length - 1) {
                                        notification.warning({
                                            title: '排班已删除',
                                            description: `${record.name} 的 ${index} 的 ${banList.join('、')} 排班已删除!`
                                        });
                                        refresh();
                                    }
                                })
                            );
                        }
                    } else {
                        onCellClick({
                            name: record.name,
                            day,
                            bans: record[index] ?? [],
                        });
                    }
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
