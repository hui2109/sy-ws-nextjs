'use client';

import {Table} from "antd";
import React, {useEffect, useState} from "react";
import getExpectTableData, {IExpectTableData} from "@/api/utils/getExpectTableData";
import {IScheduleCellInfo} from "@/api/utils/getScheduleTableData";

export default function ExpectTable({selectedCell}: { selectedCell: IScheduleCellInfo }) {
    const [loading, setLoading] = useState(true);
    const [expectTableData, setExpectTableData] = useState<IExpectTableData>({dataSource: [], columns: []});

    useEffect(() => {
        getExpectTableData(selectedCell.name, selectedCell.day).then(data => {
            setExpectTableData(data);
            setLoading(false);
        });
        return () => setLoading(true);
    }, [selectedCell.name, selectedCell.day])

    return (
        <div style={{borderRadius: 8, overflow: 'hidden'}}>
            <Table
                loading={loading}
                columns={expectTableData.columns}
                dataSource={expectTableData.dataSource}
                pagination={false}
                column={{align: 'center'}}
                size={"small"}
                bordered
            />
        </div>
    );

}