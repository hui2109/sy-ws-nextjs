'use client';

import React, {useEffect, useState} from 'react';
import {Table} from 'antd';
import {Dayjs} from "dayjs";
import {getScheduleTableData, IScheduleTableData} from "@/app/api/utils/getScheduleTableData";

interface IScheduleTableProps {
    current: Dayjs;
}

export default function ScheduleTable({current}: IScheduleTableProps) {
    const [scheduleTableData, setScheduleTableData] = useState<IScheduleTableData>({dataSource: [], columns: []});
    const [loading, setLoading] = useState(true);
    const {dataSource, columns} = scheduleTableData;

    useEffect(() => {
        getScheduleTableData(current).then(data => {
            setScheduleTableData(data);
            setLoading(false);
        });
    }, [current]);

    return (
        <Table
            loading={loading}
            columns={columns}
            dataSource={dataSource}
            scroll={{x: 'max-content', y: 600}}
            pagination={false}
            title={(currentPageData) => {
                // console.log(currentPageData);
                return (
                    <div className='text-center text-2xl text-blue-600 font-bold'>
                        {current.format('YYYY年M月')} 放疗技术组排班表
                    </div>
                );
            }}
            footer={(currentPageData) => {
                // console.log(currentPageData);
                return (
                    ''
                );
            }}
            column={{align: 'center'}}
            size={'large'}
            bordered
        />
    );
}

