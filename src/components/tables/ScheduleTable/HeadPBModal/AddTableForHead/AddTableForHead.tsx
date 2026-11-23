import {Table} from "antd";
import useAddTableForHeadData from "@/components/tables/ScheduleTable/HeadPBModal/AddTableForHead/useAddTableForHeadData";

export default function AddTableForHead() {
    const {dataSource, columns, loading} = useAddTableForHeadData();

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
