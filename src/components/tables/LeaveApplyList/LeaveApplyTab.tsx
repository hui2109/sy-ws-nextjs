'use client';

import {Tabs, TabsProps} from "antd";
import NewLeaveApplyForm from "@/components/tables/LeaveApplyList/NewLeaveApplyForm";

export type TLeaveApplyStatus = '已通过' | '已退回' | '待审核' | '草稿';
export const leaveApplyStatusColorMap: Record<TLeaveApplyStatus, string> = {
    '已通过': 'green',
    '已退回': 'magenta',
    '待审核': 'orange',
    '草稿': 'geekblue',
};
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
            label: '查看记录',
            children: '查看记录'
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