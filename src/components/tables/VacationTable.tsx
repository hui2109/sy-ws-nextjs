import {Table} from "antd";

export default function VacationTable() {
    const dataSource = [{
        key: '假A',
        days: 3,
    }, {
        key: '假B',
        days: 2,
    }, {
        key: '假C',
        days: 6,
    }
    ]

    const columns = [
        {
            title: '',
            dataIndex: 'key',
            width: 80,
            onCell: () => ({
                style: {background: '#fafafa', fontWeight: 600}
            }),
        },
        {
            title: '假期剩余天数',
            dataIndex: 'days',
        }
    ]

    return (
        <Table
            loading={false}
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            column={{align: 'center'}}
            size={"small"}
            bordered
        />
    );

}