'use client';

import {Tabs, TabsProps} from "antd";
import LeaveApplyFormNew from "@/components/tables/LeaveApplyTab/LeaveApplyFormNew";
import LeaveApplyList from "@/components/tables/LeaveApplyTab/LeaveApplyList";

export default function LeaveApplyTab() {
    const tab_items: TabsProps['items'] = [
        {
            key: '1',
            label: '发起提交',
            children: (
                <LeaveApplyFormNew/>
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
            children: (
                <LeaveApplyList/>
            )
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
