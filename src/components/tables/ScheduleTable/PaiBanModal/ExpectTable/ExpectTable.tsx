import React from "react";
import {Table} from "antd";
import useExpectTableData from "@/components/tables/ScheduleTable/PaiBanModal/ExpectTable/useExpectTableData";

export default function ExpectTable() {
    const {dataSource, columns, loading} = useExpectTableData();

    return (
        <Table
            loading={loading}
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            column={{align: 'center'}}
            size={"small"}
            bordered
        />
    );
}
