'use client';

import getLeaveAppointmentbyDate, {ILeaveAppointmentData} from "@/api/LeaveAppointment/getLeaveAppointmentbyDate";
import React, {useEffect, useState} from "react";
import {useCurrentContext} from "@/components/hooks/CurrentContext";
import {Badge, TableColumnsType} from "antd";
import NullText from "@/components/others/NullText";
import {Weekdays} from "@/configs/general";
import dayjs, {Dayjs} from "dayjs";

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
    const {current} = useCurrentContext();
    const [loading, setLoading] = useState<boolean>(true);
    const [LADateData, setLADateDate] = useState<Record<string, ILeaveAppointmentData> | null>(null);

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
            title: current.format('YY年M月'),
            dataIndex: 'date',
            key: 'date',
            render: (text: string) => {
                const day = dayjs(text);

                return (
                    <div className="flex flex-col items-center font-bold">
                        <span>{day.date()}</span>
                        <span>({Weekdays[day.day()]})</span>
                    </div>
                );
            },
        },
        ...sequenceNumbers.map(seq => {
                const dataIndex = `seq_${seq}` as SequenceKey;
                return {
                    title: seq,
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
                            onClick: () =>
                                onCellClick({
                                    sequence: seq,
                                    day: dayjs(record.key),
                                    name: appointment?.name,
                                    banName: appointment?.banName,
                                    color: appointment?.color,
                                }),
                        };
                    },
                };
            },
        ),
    ];

    return {dataSource, columns, loading};
}

function LeaveAppointmentBadge({name, banName, color}: ILeaveAppointmentData) {
    return (
        <div className="inline-flex flex-col items-center justify-center gap-1.5
        rounded-xl border border-slate-200 bg-white px-3 py-2
        shadow-[0_4px_12px_rgba(15,23,42,0.12)]
        transition-all duration-200
        hover:-translate-y-0.5
        hover:shadow-[0_8px_20px_rgba(15,23,42,0.16)]">
            <span className="text-sm font-medium text-slate-700">
              {name}
            </span>

            <Badge
                count={banName}
                color={color}
                classNames={{indicator: '!rounded-lg !font-bold'}}
            />
        </div>
    );
}
