import {IconFont, IconType} from "@/assets/icons/IconFont";
import {MenuProps} from "antd";
import React from "react";
import Link from "next/link";

interface MenuBarItem {
    title: string;
    key: string;
    icon: {
        type: IconType;
        className: string;
        useSvg: boolean;
    };
    children?: MenuBarItem[];
}

export const topMenuBar: MenuProps['items'] = [
    {
        label: (
            <div className="!text-lg font-bold">
                <IconFont type={IconType.wodepaiban} useSvg={false} className={'me-2 !text-green-300'}/>
                <Link href='/mySchedule' className="!text-inherit"><b>我的排班</b></Link>
            </div>
        ),
        key: '/mySchedule',
    },
    {
        label: (
            <div className="!text-lg font-bold">
                <IconFont type={IconType.quankepaiban} useSvg={false} className={'me-2 !text-green-800'}/>
                <Link href='/allSchedule' className="!text-inherit"><b>全科排班</b></Link>
            </div>
        ),
        key: '/allSchedule',
    },
    {
        label: (
            <div className="!text-lg font-bold">
                <IconFont type={IconType.yuyuexiejia} useSvg={false} className={'me-2 !text-yellow-400'}/>
                <Link href='/leaveSchedule' className="!text-inherit"><b>预约休假</b></Link>
            </div>
        ),
        key: '/leaveSchedule',
    },
    {
        label: (
            <div className="!text-lg font-bold">
                <IconFont type={IconType.qiwangpaiban} useSvg={false} className={'me-2 !text-pink-600'}/>
                <Link href='/expectSchedule' className="!text-inherit"><b>期望排班</b></Link>
            </div>
        ),
        key: '/expectSchedule',
    },
    {
        label: (
            <div className="!text-lg font-bold">
                <IconFont type={IconType.jiaqinshenqing} useSvg={true} className={'me-2'}/>
                <Link href='/leaveApply' className="!text-inherit"><b>假勤申请</b></Link>
            </div>
        ),
        key: '/leaveApply',
    },
    {
        label: (
            <div className="!text-lg font-bold">
                <IconFont type={IconType.tongji} useSvg={true} className={'me-2'}/>
                <Link href='/statistics' className="!text-inherit"><b>统计</b></Link>
            </div>
        ),
        key: '/statistics',
    },
    {
        label: (
            <div className="!text-lg font-bold">
                <IconFont type={IconType.paibangongju} useSvg={true} className={'me-2'}/>
                <Link href='/scheduleTools' className="!text-inherit"><b>排班工具</b></Link>
            </div>
        ),
        key: '/scheduleTools',
    }
]

export const scheduleToolsMenuBar: MenuProps['items'] = [
    {
        label: (
            <div className="!text-lg font-bold">
                <IconFont type={IconType.kaishipaiban} useSvg={false} className={'me-2 !text-pink-600'}/>
                <Link href='/scheduleTools/start' className="!text-inherit"><b>开始排班</b></Link>
            </div>
        ),
        key: '/scheduleTools/start',
        children: [
            {
                label: (
                    <div className="!text-lg font-bold">
                        <IconFont type={IconType.qingkongpaiban} useSvg={true} className={'me-2'}/>
                        <b>清空排班</b>
                    </div>
                ),
                key: 'qingkongpaiban',
            },
            {
                label: (
                    <div className="!text-lg font-bold">
                        <IconFont type={IconType.hechapaiban} useSvg={false} className={'me-2 !text-green-600'}/>
                        <b>核查排班</b>
                    </div>
                ),
                key: 'hechapaiban',
            },
            {
                label: (
                    <div className="!text-lg font-bold">
                        <IconFont type={IconType.tijiaopaiban} useSvg={true} className={'me-2'}/>
                        <b>提交排班</b>
                    </div>
                ),
                key: 'tijiaopaiban',
            },
            {
                label: (
                    <div className="!text-lg font-bold">
                        <IconFont type={IconType.shenhepaiban} useSvg={true} className={'me-2'}/>
                        <b>审核排班</b>
                    </div>
                ),
                key: 'shenhepaiban',
            },
            {
                label: (
                    <div className="!text-lg font-bold">
                        <IconFont type={IconType.daochupaiban} useSvg={false} className={'me-2 !text-teal-600'}/>
                        <b>导出排班</b>
                    </div>
                ),
                key: 'daochupaiban',
            }
        ]
    },
    {
        label: (
            <div className="!text-lg font-bold">
                <IconFont type={IconType.jiaqishezhi} useSvg={false} className={'me-2 !text-pink-600'}/>
                <Link href='/scheduleTools/holidaySettings' className="!text-inherit"><b>假期设置</b></Link>
            </div>
        ),
        key: '/scheduleTools/holidaySettings',
    }
]

// 定值menuBar样式
export const menuBarStyle = {
    components: {
        Menu: {
            darkItemSelectedBg: 'transparent',  // 选中项背景色（dark 主题）
            darkItemSelectedColor: '#4978eb'
        },
    },
}

export function buildMenuItems(items: MenuBarItem[]): MenuProps['items'] {
    if (items.length === 0) return [];
    return items.map((item) => {
        const subChildren = 'children' in item && Array.isArray(item.children) && item.children.length > 0
            ? buildMenuItems(item.children as MenuBarItem[])
            : undefined;

        const menuBtn = (
            <div className="!text-lg font-bold">
                <IconFont type={item.icon.type} useSvg={item.icon.useSvg} className={'me-2 ' + item.icon.className}/>
                <b>{item.title}</b>
            </div>
        );
        const menuItem = (item.key.startsWith('/')) ? <Link href={item.key}>{menuBtn}</Link> : menuBtn

        return {
            key: item.key,
            label: menuItem,
            children: subChildren,
        }
    });
}