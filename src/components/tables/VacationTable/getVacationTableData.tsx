import {Dayjs} from "dayjs";
import getRemainDaysbyNameDate from "@/api/VacationRule/getRemainDaysbyNameDate";
import {Badge, TableColumnsType} from "antd";
import React from "react";

export interface IVacationTableData {
    dataSource: { key: string, days: number, color: string }[],
    columns: TableColumnsType
}

export default async function getVacationTableData(name: string, date: Dayjs): Promise<IVacationTableData> {
    const dataSource: IVacationTableData["dataSource"] = await getRemainDaysbyNameDate(name, date.format('YYYY-MM-DD'));
    const columns: TableColumnsType = [
        {
            title: '',
            dataIndex: 'key',
            width: 80,
            onCell: () => ({
                style: {background: '#fafafa', fontWeight: 600}
            }),
        },
        {
            title: '假期剩余天数',
            dataIndex: 'days',
            render: (value: number, record) => (
                <Badge
                    count={value}
                    color={record.color}
                    classNames={{indicator: '!rounded-lg !font-bold'}}
                    showZero
                />
            )
        }
    ];

    return {
        dataSource,
        columns
    }
}