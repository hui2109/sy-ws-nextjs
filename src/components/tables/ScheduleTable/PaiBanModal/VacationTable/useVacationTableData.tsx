import React, {useContext, useEffect, useState} from "react";
import getRemainDaysbyNameDate from "@/api/VacationRule/getRemainDaysbyNameDate";
import {Badge, TableColumnsType} from "antd";
import {SelectedCellContext} from "@/components/hooks/SelectedCellContext";

export interface IVacationTableData {
    dataSource: { key: string; days: number; color: string }[];
    columns: TableColumnsType;
    loading: boolean;
}

const columns: TableColumnsType = [
    {
        title: '',
        dataIndex: 'key',
        width: 80,
        onCell: () => ({
            style: {background: '#fafafa', fontWeight: 600},
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
        ),
    },
];

export default function useVacationTableData(): IVacationTableData {
    const [dataSource, setDataSource] = useState<IVacationTableData['dataSource']>([]);
    const [loading, setLoading] = useState(true);

    const {selectedCell} = useContext(SelectedCellContext);
    const {name, day} = selectedCell;
    const formatDate = day.format('YYYY-MM-DD');

    useEffect(() => {
        let isMounted = true;

        getRemainDaysbyNameDate(name, formatDate).then(data => {
            if (isMounted) {
                setDataSource(data);
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            setLoading(true); // name/date 变更时重置 loading，准备下一次请求
        };
    }, [name, formatDate]);

    return {dataSource, columns, loading};
}
