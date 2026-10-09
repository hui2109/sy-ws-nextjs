'use client';

import getLeaveAppointmentbyDate, {ILeaveAppointmentData} from "@/api/LeaveAppointment/getLeaveAppointmentbyDate";
import React, {useEffect, useState} from "react";
import {useCurrentContext} from "@/components/hooks/CurrentContext";
import {Badge, TableColumnsType} from "antd";
import NullText from "@/components/others/NullText";
import {Weekdays} from "@/configs/general";
import dayjs, {Dayjs} from "dayjs";
import {useAppContext} from "@/components/hooks/AppProvider";
import computeLATableCellClickable from "@/components/utils/computeLATableCellClickable";
import {Role} from "@/prisma/generated/enums";
import {getPersonRole} from "@/api/Person/getPersonRole";

export interface ILATableCellInfo {
    sequence: number,
    day: Dayjs,
    name: string | undefined,
    banName: string | undefined,
    color: string | undefined,
}

type SequenceKey = `seq_${number}`;
type LeaveAppointmentRow = {
    key: string;
    date: string;
} & Record<SequenceKey, ILeaveAppointmentData>;

export default function useLeaveAppointmentTableData(onCellClick: (info: ILATableCellInfo) => void) {
    const {notification, currentUser} = useAppContext();
    const {current} = useCurrentContext();
    const [loading, setLoading] = useState<boolean>(true);
    const [LADateData, setLADateDate] = useState<Record<string, ILeaveAppointmentData> | null>(null);
    const [role, setRole] = useState<Role | null>(null);

    useEffect(() => {
        let isMounted = true;
        getLeaveAppointmentbyDate(current.format('YYYY-MM-DD')).then(LADateData => {
            if (isMounted) {
                setLADateDate(LADateData);
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            setLoading(true);
        };
    }, [current]);

    useEffect(() => {
        if (!currentUser) return;
        let isMounted = true;

        getPersonRole(currentUser).then(role => {
            if (isMounted) {
                setRole(role);
            }
        })

        return () => {
            isMounted = false;
        };
    }, [currentUser]);

    if (!LADateData) return {dataSource: [], columns: [], loading};

    const sequenceNumbers = Array.from({length: 10}, (_, i) => i + 1);
    const dataSource: LeaveAppointmentRow[] = Array.from(
        {length: current.daysInMonth()},
        (_, i) => {
            const date = current.date(i + 1).format('YYYY-MM-DD');

            return {
                key: date,
                date,
                ...Object.fromEntries(
                    sequenceNumbers.map(seq => [
                        `seq_${seq}`,
                        LADateData[`${date}_${seq}`],
                    ])
                ),
            };
        }
    );
    const columns: TableColumnsType<LeaveAppointmentRow> = [
        {
            title: (
                <div className='max-desktop:!text-[12px]'>
                    {current.format('YY年M月')}
                </div>
            ),
            fixed: 'start',
            dataIndex: 'date',
            key: 'date',
            render: (text: string) => {
                const day = dayjs(text);

                return (
                    <div className="flex flex-col items-center font-bold justify-center max-desktop:!text-[12px]">
                        <div>{day.date()}</div>
                        <div>({Weekdays[day.day()]})</div>
                    </div>
                );
            },
        },
        ...sequenceNumbers.map(seq => {
                const dataIndex = `seq_${seq}` as SequenceKey;
                return {
                    title: (
                        <div className='max-desktop:!text-[12px]'>
                            {seq}
                        </div>
                    ),
                    dataIndex,
                    render: (data: ILeaveAppointmentData | undefined) => {
                        if (!data) {
                            return <NullText/>;
                        }

                        return (
                            <LeaveAppointmentBadge
                                name={data.name}
                                banName={data.banName}
                                color={data.color}
                            />
                        );
                    },
                    onCell: (record: LeaveAppointmentRow) => {
                        const appointment = record[dataIndex];
                        return {
                            style: {
                                cursor: 'pointer',
                            },
                            onClick: () => {
                                const day = dayjs(record.key)
                                if (role && (computeLATableCellClickable(day) || role === 'SUPERADMIN')) {
                                    onCellClick({
                                        sequence: seq,
                                        day: day,
                                        name: appointment?.name,
                                        banName: appointment?.banName,
                                        color: appointment?.color,
                                    })
                                } else {
                                    notification.warning({
                                        title: '目前不可预约休假',
                                        description: `${dayjs().month() < 6 ? '今年 6 月 15 号后可以预约下半年假期!' : '今年 12 月 15 号后可以预约明年上半年假期!'}`
                                    })
                                }
                            },
                        };
                    },
                };
            },
        ),
    ];

    return {dataSource, columns, loading};
}

function LeaveAppointmentBadge({name, banName, color}: ILeaveAppointmentData) {
    const {resolvedTheme} = useAppContext();
    const isDark = resolvedTheme === 'dark';

    return (
        <div className={`inline-flex flex-col items-center justify-center gap-1.5
        rounded-lg border px-3 py-2
        shadow-[0_4px_12px_rgba(15,23,42,0.12)]
        transition-all duration-200
        hover:-translate-y-0.5
        hover:shadow-[0_8px_20px_rgba(15,23,42,0.16)]
        max-desktop:px-1 max-desktop:py-1 max-desktop:text-[12px] max-desktop:gap-0.5
        ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
            <span className={`font-medium ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
              {name}
            </span>

            <Badge
                count={banName}
                color={color}
                classNames={{indicator: '!rounded-lg !font-bold max-desktop:!text-[10px]'}}
            />
        </div>
    );
}
