import {Table} from "antd";
import useVacationTableData from "@/components/tables/ScheduleTable/PaiBanModal/VacationTable/useVacationTableData";

export default function VacationTable() {
    const {dataSource, columns, loading} = useVacationTableData();

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
