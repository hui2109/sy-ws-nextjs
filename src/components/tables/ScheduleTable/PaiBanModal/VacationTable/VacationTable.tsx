import {Table} from "antd";
import useVacationTableData from "@/components/tables/ScheduleTable/PaiBanModal/VacationTable/useVacationTableData";

export default function VacationTable() {
    const {dataSource, columns, loading} = useVacationTableData();

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
