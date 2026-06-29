import {Table} from "antd";
import useAddTableData from "@/components/tables/ScheduleTable/PaiBanModal/AddTable/useAddTableData";

export default function AddTable() {
    const {dataSource, columns, loading} = useAddTableData();

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
