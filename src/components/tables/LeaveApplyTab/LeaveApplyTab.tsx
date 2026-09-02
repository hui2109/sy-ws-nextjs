'use client';

import {Tabs, TabsProps} from "antd";
import {InboxOutlined, PlusCircleOutlined, SendOutlined,} from "@ant-design/icons";
import LeaveApplyFormNew from "@/components/tables/LeaveApplyTab/LeaveApplyFormNew";
import LeaveApplyList from "@/components/tables/LeaveApplyTab/LeaveApplyList";
import {useAppContext} from "@/components/hooks/AppProvider";

export type LeaveApplyTabStatus = 'Sent' | 'Received';

export default function LeaveApplyTab() {
    const {currentUser, resolvedTheme} = useAppContext();
    const isDark = resolvedTheme === 'dark';

    if (!currentUser) return null;

    const tab_items: TabsProps['items'] = [
        {
            key: '1',
            label: (
                <div className="flex items-center gap-2">
                    <PlusCircleOutlined/>
                    提交申请
                </div>
            ),
            children: (
                <LeaveApplyFormNew/>
            )
        },
        {
            key: '2',
            label: (
                <div className="flex items-center gap-2">
                    <SendOutlined/>
                    我发起的
                </div>
            ),
            children: (
                <LeaveApplyList
                    name={currentUser}
                    leaveApplyTabStatus="Sent"
                />
            )
        },
        {
            key: '3',
            label: (
                <div className="flex items-center gap-2">
                    <InboxOutlined/>
                    我收到的
                </div>
            ),
            children: (
                <LeaveApplyList
                    name={currentUser}
                    leaveApplyTabStatus="Received"
                />
            )
        },
    ];

    return (
        <div className={`rounded-2xl border shadow-sm transition-colors ${
            isDark
                ? 'border-slate-700/80 bg-slate-900/60 shadow-black/20'
                : 'border-slate-200 bg-white shadow-slate-200/60'
        }`}>
            <Tabs
                defaultActiveKey="1"
                centered
                items={tab_items}
                className="
                    [&_.ant-tabs-nav]:!mb-0
                    [&_.ant-tabs-nav]:!px-6
                    [&_.ant-tabs-nav]:!pt-2

                    [&_.ant-tabs-tab]:!px-5
                    [&_.ant-tabs-tab]:!py-4
                    [&_.ant-tabs-tab]:!text-[15px]
                    [&_.ant-tabs-tab]:!font-medium

                    [&_.ant-tabs-tab_.anticon]:!text-base
                    [&_.ant-tabs-tab_.anticon]:!opacity-70

                    [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!font-semibold
                    [&_.ant-tabs-tab-active_.anticon]:!opacity-100

                    [&_.ant-tabs-content-holder]:!p-5

                    [&_.ant-tabs-ink-bar]:!h-[3px]
                    [&_.ant-tabs-ink-bar]:!rounded-full
                "
            />
        </div>
    );
}
