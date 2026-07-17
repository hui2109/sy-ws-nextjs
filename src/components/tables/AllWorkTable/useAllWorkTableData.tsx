import React, {useEffect, useState} from "react";
import {getWSbyMonth} from "@/api/WorkSchedule/getWSbyMonth";
import {getBanTypeColorMap} from "@/api/BanType/getBanTypeColorMap";
import {sortBanTypeList} from "@/components/utils/sortBanTypeList";
import {Badge, TableColumnsType} from "antd";
import {Weekdays} from "@/configs/general";
import NullText from "@/components/utils/NullText";
import {getMonthStatusBadge} from "@/components/utils/getMonthStatusBadge";
import {useCurrentContext} from "@/components/hooks/CurrentContext";
import {Dayjs} from "dayjs";

export interface IWorkTableCellInfo {
    name: string;
    day: Dayjs;
    bans: string[];
}

export default function useAllWorkTableData(onCellClick: (info: IWorkTableCellInfo) => void) {
    const {current} = useCurrentContext();
    const [loading, setLoading] = useState<boolean>(true);
    const [DBData, setDBData] = useState<Awaited<ReturnType<typeof getWSbyMonth>> | null>(null);
    const [banTypeColorMap, setBanTypeColorMap] = useState<Record<string, string> | null>(null);

    useEffect(() => {
        let isMounted = true;
        const formatCurrDate = current.format('YYYY-MM-DD');

        getWSbyMonth(formatCurrDate, false).then(DBData => {
            if (isMounted) {
                setDBData(DBData);
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            setLoading(true);
        };
    }, [current]);

    useEffect(() => {
        let isMounted = true;

        getBanTypeColorMap().then(banTypeColorMap => {
            if (isMounted) {
                setBanTypeColorMap(banTypeColorMap);
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            setLoading(true);
        };
    }, []);

    if (!DBData || !banTypeColorMap) return {dataSource: [], columns: [], loading};

    const dataSource = Object.entries(DBData.nameBansMap)
        .filter(([, scheduleInfo]) => Object.keys(scheduleInfo).length > 0)
        .map(([personName, scheduleInfo]) => {
            const rowData: {
                key: string;
                name: string;
                [date: string]: string[] | string;
            } = {
                key: personName,
                name: personName,
            };

            for (const [stringDate, bansList] of Object.entries(scheduleInfo)) {
                rowData[stringDate] = sortBanTypeList(bansList);
            }

            return rowData;
        });

    const daysInMonth = Array.from(
        {length: current.daysInMonth()},
        (_, i) => current.date(i + 1)
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
            render: (text: Array<string> | undefined) => {
                if (!text) {
                    return <NullText/>
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
                onClick: () => onCellClick({name: record.name, day, bans: record[index] ?? []}),
            }),
        };
    });

    columns.unshift({
        title: getMonthStatusBadge(DBData.monthStatus),
        dataIndex: 'name',
        fixed: 'start',
        width: 80,
        render: (text) => (
            <div className='font-bold'>{text}</div>
        ),
    });
    return {dataSource, columns, loading};
}