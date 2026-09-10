import React, {useEffect, useMemo, useState} from "react";
import {Badge, TableColumnsType} from "antd";
import {Weekdays} from "@/configs/general";
import {Dayjs} from "dayjs";
import {getWSbyMonth} from "@/api/WorkSchedule/getWSbyMonth";
import {getBanTypeColorMap} from "@/api/BanType/getBanTypeColorMap";
import NullText from "@/components/others/NullText";
import {deleteWSRecord} from "@/api/WorkSchedule/deleteWSRecord";
import {useAppContext} from "@/components/hooks/AppProvider";
import {NotificationInstance} from "antd/es/notification/interface";
import {useScheduleTableContext} from "@/components/hooks/ScheduleTableContext";
import {sortBanTypeList} from "@/components/utils/sortBanTypeList";
import {MonthStatusBadge} from "@/components/others/MonthStatusBadge";
import {getPersonRole} from "@/api/Person/getPersonRole";
import {Role} from "@/prisma/generated/enums";
import VacationIndicator from "@/components/others/VacationIndicator";

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
};

export default function useScheduleTableData(
    stToolStatus: IScheduleTableTools,
    onCellClick: (info: IScheduleCellInfo) => void
): IScheduleTableData {
    const {currentUser, notification} = useAppContext();
    const {current, refreshKey, refresh, setMonthStatus} = useScheduleTableContext();
    const [loading, setLoading] = useState<boolean>(true);
    const [asyncState, setAsyncState] = useState<AsyncState | null>(null);
    const [banTypeColorMap, setBanTypeColorMap] = useState<Record<string, string> | null>(null);
    const [role, setRole] = useState<Role | null>(null);

    useEffect(() => {
        if (!currentUser) return;
        let isMounted = true;

        Promise.all([
            getBanTypeColorMap(),
            getPersonRole(currentUser),
        ]).then(([banTypeColorMap, role]) => {
            if (isMounted) {
                setBanTypeColorMap(banTypeColorMap);
                setRole(role);
            }
        });

        return () => {
            isMounted = false;
        }
    }, [currentUser]);

    // ✅ Effect 1：只管当月数据，showPrevMonth 变化时完全不触发
    useEffect(() => {
        let isMounted = true;
        const formatCurrDate = current.format('YYYY-MM-DD');

        getWSbyMonth(formatCurrDate).then(dbDataCurr => {
            if (isMounted) {
                setAsyncState(prev => ({...prev, dbDataCurr, dbDataPrev: prev?.dbDataPrev ?? null}));
                setLoading(false);
                setMonthStatus(dbDataCurr.monthStatus)
            }
        });

        return () => {
            isMounted = false;
            setLoading(true);
        };
    }, [current, refreshKey, setMonthStatus]);

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

    if (!asyncState || !role || !banTypeColorMap) {
        return {dataSource, columns: [], loading};
    }

    const {dbDataCurr, dbDataPrev} = asyncState;
    const {monthStatus} = dbDataCurr;
    const effectiveDbDataPrev = stToolStatus.showPrevMonth ? dbDataPrev : null;
    const columns = getColumns(current, monthStatus, banTypeColorMap, effectiveDbDataPrev, stToolStatus.eraser, notification, refresh, onCellClick, role);

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
    onCellClick: (info: IScheduleCellInfo) => void,
    role: Role
): TableColumnsType {
    const daysInMonth = Array.from(
        {length: date.daysInMonth()},
        (_, i) => date.date(i + 1)
    );
    const canEdit = monthStatus === '已发布'
        ? role === 'SUPERADMIN'
        : role !== 'USER';

    const columns: TableColumnsType = daysInMonth.map(day => {
        const index = day.format('YYYY-MM-DD');
        return {
            title: (
                <div className='flex flex-col items-center font-bold relative'>
                    <span>{Weekdays[day.day()]}</span>
                    <span>{day.date()}</span>
                    <VacationIndicator date={day}/>
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
                style: {cursor: eraser ? 'none' : 'pointer'},
                onClick: async () => {
                    if (!canEdit) return;

                    if (eraser) {
                        const banList: string[] = record[index] ?? [];
                        if (!banList.length) return;

                        await Promise.all(
                            banList.map(banName =>
                                deleteWSRecord(index, banName, record.name)
                            )
                        );

                        notification.warning({
                            title: '排班已删除',
                            description: `${record.name} 的 ${index} 的 ${banList.join('、')} 排班已删除!`
                        });
                        refresh();
                        return;
                    }

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
        title: MonthStatusBadge(monthStatus),
        dataIndex: 'name',
        fixed: 'start',
        width: 80,
        render: (text) => (
            <div className='font-bold'>{text}</div>
        ),
    });

    return columns;
}

function currDateToPreDate(currDate: Dayjs): string {
    const preDate = currDate.subtract(1, 'month');
    const daysLeft = currDate.date() - currDate.startOf('month').date();
    return preDate.endOf('month').subtract(daysLeft, 'day').format('YYYY-MM-DD');
}
