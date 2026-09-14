import {Table} from "antd";
import useAddTableData from "@/components/tables/ScheduleTable/PaiBanModal/AddTable/useAddTableData";

export default function AddTable() {
    const {dataSource, columns, loading} = useAddTableData();

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
