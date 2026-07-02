import React, {useEffect, useState} from "react";
import {Badge, TableColumnsType} from "antd";
import findExpectedSchedulebyNameDate from "@/api/ExpectedSchedule/findExpectedSchedulebyNameDate";
import findLeaveppointmentbyNameDate from "@/api/LeaveAppointment/findLeaveppointmentbyNameDate";
import findExpectedSchedulebyDateBanName from "@/api/ExpectedSchedule/findExpectedSchedulebyDateBanName";
import findLeaveppointmentbyDate from "@/api/LeaveAppointment/findLeaveppointmentbyDate";
import NullText from "@/components/utils/NullText";
import {useSelectedCellContext} from "@/components/hooks/SelectedCellContext";

export interface IExpectTableData {
    dataSource: {
        key: string;
        expectPaiBan: string | IOthersExpectScheduleData[] | React.ReactNode;
        expectXiuJia: string | IOthersLeaveAppointmentData[] | React.ReactNode;
    }[];
    columns: TableColumnsType;
    loading: boolean;
}

export interface IOthersExpectScheduleData {
    sequenceNumber: string;
    name: string;
}

export interface IOthersLeaveAppointmentData {
    sequenceNumber: string;
    name: string;
    banName: string;
    color: string;
}

type AsyncState = {
    expectedSchedule: Awaited<ReturnType<typeof findExpectedSchedulebyNameDate>>;
    leaveAppointment: Awaited<ReturnType<typeof findLeaveppointmentbyNameDate>>;
    othersExpectSchedule: Awaited<ReturnType<typeof findExpectedSchedulebyDateBanName>>;
    othersLeaveAppointment: Awaited<ReturnType<typeof findLeaveppointmentbyDate>>;
};

const initialAsyncState: AsyncState = {
    expectedSchedule: null,
    leaveAppointment: null,
    othersExpectSchedule: null,
    othersLeaveAppointment: null,
};

export default function useExpectTableData(): IExpectTableData {
    const [asyncState, setAsyncState] = useState<AsyncState>(initialAsyncState);
    const [loading, setLoading] = useState(true);

    const {selectedCell} = useSelectedCellContext();
    const {name, day} = selectedCell;
    const formatDate = day.format('YYYY-MM-DD');

    useEffect(() => {
        let isMounted = true;

        (async () => {
            // 第一阶段：两个独立请求并行发出
            const [expectedSchedule, leaveAppointment] = await Promise.all([
                findExpectedSchedulebyNameDate(name, formatDate),
                findLeaveppointmentbyNameDate(name, formatDate),
            ]);

            // 第二阶段：依赖第一阶段结果，但两者彼此独立，仍可并行
            const [othersExpectSchedule, othersLeaveAppointment] = await Promise.all([
                expectedSchedule
                    ? findExpectedSchedulebyDateBanName(formatDate, expectedSchedule.banName, name)
                    : Promise.resolve(null),
                leaveAppointment
                    ? findLeaveppointmentbyDate(formatDate, name)
                    : Promise.resolve(null),
            ]);

            // 防竞态：若 name/date 已变更（cleanup 将 isMounted 置 false），则丢弃旧结果
            if (isMounted) {
                setAsyncState({expectedSchedule, leaveAppointment, othersExpectSchedule, othersLeaveAppointment});
                setLoading(false);
            }
        })();

        return () => {
            isMounted = false;
            setLoading(true);
        };
    }, [name, formatDate]);

    const {expectedSchedule, leaveAppointment, othersExpectSchedule, othersLeaveAppointment} = asyncState;

    const dataSource: IExpectTableData['dataSource'] = [
        {
            key: '班种',
            expectPaiBan: expectedSchedule?.banName ?? <NullText/>,
            expectXiuJia: leaveAppointment?.banName ?? <NullText/>,
        },
        {
            key: '顺序',
            expectPaiBan: expectedSchedule?.sequenceNumber ?? <NullText/>,
            expectXiuJia: leaveAppointment?.sequenceNumber ?? <NullText/>,
        },
        {
            key: '其他人',
            expectPaiBan: othersExpectSchedule ?? <NullText/>,
            expectXiuJia: othersLeaveAppointment ?? <NullText/>,
        },
    ];

    const columns = getColumns(expectedSchedule?.color, leaveAppointment?.color);

    return {dataSource, columns, loading};
}

function getColumns(
    expectedScheduleBanColor: string | undefined,
    leaveAppointmentBanColor: string | undefined,
): TableColumnsType {
    return [
        {
            title: '',
            dataIndex: 'key',
            width: 80,
            onCell: () => ({
                style: {background: '#fafafa', fontWeight: 600},
            }),
        },
        {
            title: '期望排班',
            dataIndex: 'expectPaiBan',
            render: (text: string | IOthersExpectScheduleData[] | React.ReactNode) => {
                if (Array.isArray(text)) {
                    return text.map((item: IOthersExpectScheduleData) => (
                        <Badge
                            key={`${item.name} ${item.sequenceNumber}`}
                            count={`${item.name} ${item.sequenceNumber}`}
                            color={expectedScheduleBanColor}
                            classNames={{indicator: '!rounded-lg !font-bold'}}
                        />
                    ));
                }
                if (typeof text === 'string') {
                    return (
                        <Badge
                            count={text}
                            color={expectedScheduleBanColor}
                            classNames={{indicator: '!rounded-lg !font-bold'}}
                        />
                    );
                }
                return text;
            },
        },
        {
            title: '期望休假',
            dataIndex: 'expectXiuJia',
            render: (text: string | IOthersLeaveAppointmentData[] | React.ReactNode) => {
                if (Array.isArray(text)) {
                    return (
                        <div className='flex flex-col justify-center items-center gap-1'>
                            {text.map((item: IOthersLeaveAppointmentData) => (
                                <Badge
                                    key={`${item.name} ${item.sequenceNumber} ${item.banName}`}
                                    count={`${item.name} ${item.sequenceNumber} ${item.banName}`}
                                    color={item.color}
                                    classNames={{indicator: '!rounded-lg !font-bold'}}
                                />
                            ))}
                        </div>
                    );
                }
                if (typeof text === 'string') {
                    return (
                        <Badge
                            count={text}
                            color={leaveAppointmentBanColor}
                            classNames={{indicator: '!rounded-lg !font-bold'}}
                        />
                    );
                }
                return text;
            },
        },
    ];
}
