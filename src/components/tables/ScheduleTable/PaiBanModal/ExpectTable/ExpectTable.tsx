import React from "react";
import {Table} from "antd";
import useExpectTableData from "@/components/tables/ScheduleTable/PaiBanModal/ExpectTable/useExpectTableData";

export default function ExpectTable() {
    const {dataSource, columns, loading} = useExpectTableData();

    return (
        <Table
            loading={loading}
            column={{align: 'center'}}
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            footer={() => ''}
            size={"small"}
            bordered
            classNames={{
                footer: '!p-2',
                body: {cell: 'max-desktop:!p-1'},
                header: {cell: 'max-desktop:!p-1'}
            }}
            className='rounded-lg overflow-hidden'
        />
    );
}
