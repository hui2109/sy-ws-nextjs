import {Table} from "antd";
import {IScheduleCellInfo} from "@/components/tables/ScheduleTable/getScheduleTableData";
import {Dispatch, SetStateAction} from "react";
import useAddTableData from "@/components/tables/ScheduleTable/PaiBanModal/AddTable/useAddTableData";

export default function AddTable({selectedCell, setSelectedCell}: {
    selectedCell: IScheduleCellInfo;
    setSelectedCell: Dispatch<SetStateAction<IScheduleCellInfo>>;
}) {
    const {dataSource, columns, loading} = useAddTableData(selectedCell, setSelectedCell);

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
