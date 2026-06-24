import {Table} from "antd";
import {IScheduleCellInfo} from "@/api/utils/getScheduleTableData";

interface IAddTableData {
    key: string;
    already: string;
    suggestion?: string;
    newBan?: string;
}

export default function AddTable({selectedCell}: { selectedCell: IScheduleCellInfo }) {
    const dataSource = [{
        key: '1',
        already: '3A 补假',
        suggestion: '100% 3A 2A',
        newBan: '请选择'
    }, {
        key: '2',
        already: '重复几次',
    }
    ]

    const columns = [
        {
            title: '已有排班',
            dataIndex: 'already',
            onCell: (_: IAddTableData, index: number | undefined) => ({
                colSpan: index === 1 ? 3 : 1,
            }),
        }, {
            title: '建议排班',
            dataIndex: 'suggestion',
            onCell: (_: IAddTableData, index: number | undefined) => ({
                colSpan: index === 1 ? 0 : 1,  // 合并时隐藏
            }),
        },
        {
            title: '新增排班',
            dataIndex: 'newBan',
            onCell: (_: IAddTableData, index: number | undefined) => ({
                colSpan: index === 1 ? 0 : 1,  // 合并时隐藏
            }),
        },
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