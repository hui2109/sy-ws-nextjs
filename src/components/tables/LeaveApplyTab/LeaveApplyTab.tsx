'use client';

import {Tabs, TabsProps} from "antd";
import NewLeaveApplyForm from "@/components/tables/LeaveApplyTab/NewLeaveApplyForm";
import LeaveApplyList from "@/components/tables/LeaveApplyTab/LeaveApplyList";

export default function LeaveApplyTab() {
    const tab_items: TabsProps['items'] = [
        {
            key: '1',
            label: '发起提交',
            children: (
                <NewLeaveApplyForm/>
            )
        },
        {
            key: '2',
            label: '我发起的',
            children: (
                <LeaveApplyList/>
            )
        },
        {
            key: '3',
            label: '我收到的',
            children: '我收到的'
        },
    ]

    return (
        <Tabs
            defaultActiveKey="1"
            centered
            items={tab_items}
        />
    )
}
