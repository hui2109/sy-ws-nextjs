import {Dayjs} from "dayjs";
import findLeaveppointmentbyNameDate from "@/api/LeaveAppointment/findLeaveppointmentbyNameDate";
import findExpectedSchedulebyNameDate from "@/api/ExpectedSchedule/findExpectedSchedulebyNameDate";
import findExpectedSchedulebyDateBantype from "@/api/ExpectedSchedule/findExpectedSchedulebyDateBantype";
import findLeaveppointmentbyDateBantype from "@/api/LeaveAppointment/findLeaveppointmentbyDateBantype";
import NullText from "@/components/utils/NullText";
import React from "react";
import {Badge, TableColumnsType} from "antd";

export interface IExpectTableData {
    dataSource: {
        key: string;
        expectPaiBan: string | IOthersExpectScheduleData[] | number | React.ReactNode;
        expectXiuJia: string | IOthersLeaveAppointmentData[] | number | React.ReactNode;
    }[];
    columns: TableColumnsType;
}

export interface IOthersExpectScheduleData {
    sequenceNumber: number;
    name: string;
}

export interface IOthersLeaveAppointmentData {
    sequenceNumber: number;
    name: string;
    banName: string;
    color: string;
}


export default async function getExpectTableData(name: string, date: Dayjs): Promise<IExpectTableData> {
    const dataSource: IExpectTableData['dataSource'] = [];
    const formatDate = date.format('YYYY-MM-DD');

    const expectedSchedule = await findExpectedSchedulebyNameDate(name, formatDate);
    const leaveAppointment = await findLeaveppointmentbyNameDate(name, formatDate);
    // 期望排班 [其他人] 查询
    let othersExpectSchedule: Awaited<ReturnType<typeof findExpectedSchedulebyDateBantype>> = null;
    if (expectedSchedule) {
        othersExpectSchedule = await findExpectedSchedulebyDateBantype(formatDate, expectedSchedule.banName, name);
    }
    // 期望休假 [其他人] 查询
    let othersLeaveAppointment: Awaited<ReturnType<typeof findLeaveppointmentbyDateBantype>> = null;
    if (leaveAppointment) {
        othersLeaveAppointment = await findLeaveppointmentbyDateBantype(formatDate, name);
    }

    const expectedScheduleBanColor = expectedSchedule?.color;
    const leaveAppointmentBanColor = leaveAppointment?.color;

    // 整合所有数据
    dataSource.push({
        key: '班种',
        expectPaiBan: expectedSchedule?.banName ?? <NullText/>,
        expectXiuJia: leaveAppointment?.banName ?? <NullText/>,
    })
    dataSource.push({
        key: '顺序',
        expectPaiBan: expectedSchedule?.sequenceNumber ?? <NullText/>,
        expectXiuJia: leaveAppointment?.sequenceNumber ?? <NullText/>,
    })
    dataSource.push({
        key: '其他人',
        expectPaiBan: othersExpectSchedule ?? <NullText/>,
        expectXiuJia: othersLeaveAppointment ?? <NullText/>,
    })

    return {dataSource, columns: getColumns(expectedScheduleBanColor, leaveAppointmentBanColor)}
}

function getColumns(expectedScheduleBanColor: string | undefined, leaveAppointmentBanColor: string | undefined) {
    return [
        {
            title: '',
            dataIndex: 'key',
            width: 80,
            onCell: () => ({
                style: {background: '#fafafa', fontWeight: 600}
            }),
        },
        {
            title: '期望排班',
            dataIndex: 'expectPaiBan',
            render: (text: string | IOthersExpectScheduleData[] | number | React.ReactNode) => {
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
                if (typeof text === 'string' || typeof text === 'number') {
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
            render: (text: string | IOthersLeaveAppointmentData[] | number | React.ReactNode) => {
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
                    )
                }
                if (typeof text === 'string' || typeof text === 'number') {
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