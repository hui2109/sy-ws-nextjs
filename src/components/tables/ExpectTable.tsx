import {Table} from "antd";

export default function ExpectTable() {
    const dataSource = [{
        key: '班种',
        expectPaiBan: '3C',
        expectXiuJia: '放射假'
    }, {
        key: '顺序',
        expectPaiBan: 1,
        expectXiuJia: 1
    }, {
        key: '其他人',
        expectPaiBan: '谭林 廖中凡',
        expectXiuJia: '王吉锐 徐博'
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
            title: '期望排班',
            dataIndex: 'expectPaiBan',
        },
        {
            title: '期望休假',
            dataIndex: 'expectXiuJia',
        },
    ]

    return (
        <div style={{borderRadius: 8, overflow: 'hidden'}}>
            <Table
                loading={false}
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                column={{align: 'center'}}
                size={"small"}
                bordered
            />
        </div>
    );

}