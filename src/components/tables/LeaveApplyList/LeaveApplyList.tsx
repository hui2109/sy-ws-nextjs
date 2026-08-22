'use client';

import {Button, Col, Listy, Row, Select} from "antd";
import {PlusCircleOutlined} from "@ant-design/icons";
import LeaveApplyForm from "@/components/tables/LeaveApplyList/LeaveApplyForm";

export const LeaveApplyStatus = {
    APPROVED: '已通过',
    REJECTED: '已退回',
    PENDING_REVIEW: '待审核',
    DRAFT: '草稿',
}

interface Item {
    id: number;
    content: string;
}

export default function LeaveApplyList() {
    const items = Array.from({length: 200}, (_, index) => ({
        id: index,
        content: `Item ${index}`,
    }));
    const applyStatusOption = Object.values(LeaveApplyStatus).map((item) => ({
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
                <LeaveApplyForm/>
            </Col>
        </Row>
    )
}