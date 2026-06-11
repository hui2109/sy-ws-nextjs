'use client';

import React from 'react';
import {Table} from 'antd';
import {getTableData} from "@/utils/getTableData";

interface DataType {
    key: React.Key;
    name: string;
    age: number;
    address: string;
}

export default function ScheduleTable() {
    const {columns, dataSource} = getTableData();

    return (
        <Table
            columns={columns}
            dataSource={dataSource}
            scroll={{x: 'max-content', y: 600}}
            pagination={false}
            title={(currentPageData) => {
                // console.log(currentPageData);
                return (
                    <div className='text-center text-2xl text-blue-600 font-bold'>
                        2026年6月 放疗技术组排班表
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
