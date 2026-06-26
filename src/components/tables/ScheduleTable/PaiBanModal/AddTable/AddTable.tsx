import {Table} from "antd";
import {IScheduleCellInfo} from "@/components/tables/ScheduleTable/getScheduleTableData";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import getAddTableData, {IAddTableData} from "@/components/tables/ScheduleTable/PaiBanModal/AddTable/getAddTableData";

export default function AddTable({selectedCell, setSelectedCell}: { selectedCell: IScheduleCellInfo, setSelectedCell: Dispatch<SetStateAction<IScheduleCellInfo>> }) {
    const [loading, setLoading] = useState(true);
    const [addTableData, setAddTableData] = useState<IAddTableData>({dataSource: [], columns: []});

    useEffect(() => {
        getAddTableData(selectedCell, setSelectedCell).then(data => {
            setAddTableData(data);
            setLoading(false);
        });
        return () => setLoading(true);
    }, [selectedCell, setSelectedCell])

    return (
        <Table
            loading={loading}
            columns={addTableData.columns}
            dataSource={addTableData.dataSource}
            pagination={false}
            column={{align: 'center'}}
            size={"small"}
            bordered
        />
    );
}