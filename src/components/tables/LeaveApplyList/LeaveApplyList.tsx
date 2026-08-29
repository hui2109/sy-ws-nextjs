'use client';

import {Button, Col, Listy, Row, Select} from "antd";
import {PlusCircleOutlined} from "@ant-design/icons";
import NewLeaveApplyForm from "@/components/tables/LeaveApplyList/NewLeaveApplyForm";

export type TLeaveApplyStatus = '已通过' | '已退回' | '待审核' | '草稿';

export const leaveApplyStatusColorMap: Record<TLeaveApplyStatus, string> = {
    '已通过': 'green',
    '已退回': 'magenta',
    '待审核': 'orange',
    '草稿': 'geekblue',
};
const leaveApplyStatusOptions: TLeaveApplyStatus[] = ['已通过', '已退回', '待审核', '草稿'];

interface Item {
    id: number;
    content: string;
}

export default function LeaveApplyList() {
    const items = Array.from({length: 200}, (_, index) => ({
        id: index,
        content: `Item ${index}`,
    }));
    const applyStatusOption = Object.values(leaveApplyStatusOptions).map((item) => ({
        label: item,
        value: item,
    }));

    return (
        <Row>
            <Col span={6}>
                <div>
                    <Select
                        showSearch={{optionFilterProp: 'label'}}
                        placeholder="筛选申请表..."
                        // onChange={onChange}
                        options={applyStatusOption}
                        style={{width: 200}}
                        classNames={{popup: {listItem: 'text-center'}}}
                    />
                    <Button type="primary" icon={<PlusCircleOutlined/>}/>
                </div>
                <Listy<Item> items={items} height={800} rowKey="id" itemRender={(item) => item.content}/>
            </Col>
            <Col span={18}>
                <NewLeaveApplyForm/>
            </Col>
        </Row>
    )
}