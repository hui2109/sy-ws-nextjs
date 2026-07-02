import {IconType} from "@/assets/icons/IconFont";

export interface MenuBarItem {
    title: string;
    id: string;
    path?: string;
    icon: {
        type: IconType;
        className: string;
        useSvg: boolean;
    };
    children: MenuBarItem[];
}

export const menuBar: MenuBarItem[] = [
    {
        title: "我的排班",
        id: 'mySchedule',
        path: '/mySchedule',
        icon: {
            type: IconType.wodepaiban,
            className: "text-green-300",
            useSvg: false
        },
        children: [
            {
                title: "张旭辉",
                id: 'zhangxuhui',
                icon: {
                    type: IconType.wodepaibangeren,
                    className: "text-blue-300",
                    useSvg: false
                },
                children: []
            },
            {
                title: "廖中凡",
                id: 'liaozhongfan',
                icon: {
                    type: IconType.wodepaibangeren,
                    className: "text-blue-300",
                    useSvg: false
                },
                children: []
            },
        ]
    },
    {
        title: "全科排班",
        id: 'allSchedule',
        path: '/allSchedule',
        icon: {
            type: IconType.quankepaiban,
            className: "text-green-800",
            useSvg: false
        },
        children: []
    },
    {
        title: "预约休假",
        id: 'leaveSchedule',
        path: '/leaveSchedule',
        icon: {
            type: IconType.yuyuexiejia,
            className: "text-yellow-400",
            useSvg: false
        },
        children: [
            {
                title: "上半年",
                id: 'shangbannian',
                icon: {
                    type: IconType.shangbannian,
                    className: "",
                    useSvg: true
                },
                children: []
            }, {
                title: "下半年",
                id: 'xiabannian',
                icon: {
                    type: IconType.xiabannian,
                    className: "",
                    useSvg: true
                },
                children: []
            }
        ]
    },
    {
        title: "期望排班",
        id: 'expectSchedule',
        path: '/expectSchedule',
        icon: {
            type: IconType.qiwangpaiban,
            className: "text-pink-600",
            useSvg: false
        },
        children: [
            {
                title: "一月",
                id: 'yiyue',
                icon: {
                    type: IconType.yigeyuefen,
                    className: "text-orange-500",
                    useSvg: false
                },
                children: []
            },
            {
                title: "二月",
                id: 'eryue',
                icon: {
                    type: IconType.yigeyuefen,
                    className: "text-orange-500",
                    useSvg: false
                },
                children: []
            },
            {
                title: "三月",
                id: 'sanyue',
                icon: {
                    type: IconType.yigeyuefen,
                    className: "text-orange-500",
                    useSvg: false
                },
                children: []
            },
            {
                title: "四月",
                id: 'siyue',
                icon: {
                    type: IconType.yigeyuefen,
                    className: "text-orange-500",
                    useSvg: false
                },
                children: []
            },
            {
                title: "五月",
                id: 'wuyue',
                icon: {
                    type: IconType.yigeyuefen,
                    className: "text-orange-500",
                    useSvg: false
                },
                children: []
            },
            {
                title: "六月",
                id: 'liuyue',
                icon: {
                    type: IconType.yigeyuefen,
                    className: "text-orange-500",
                    useSvg: false
                },
                children: []
            },
            {
                title: "七月",
                id: 'qiyue',
                icon: {
                    type: IconType.yigeyuefen,
                    className: "text-orange-500",
                    useSvg: false
                },
                children: []
            },
            {
                title: "八月",
                id: 'bayue',
                icon: {
                    type: IconType.yigeyuefen,
                    className: "text-orange-500",
                    useSvg: false
                },
                children: []
            },
            {
                title: "九月",
                id: 'jiuyue',
                icon: {
                    type: IconType.yigeyuefen,
                    className: "text-orange-500",
                    useSvg: false
                },
                children: []
            },
            {
                title: "十月",
                id: 'shiyue',
                icon: {
                    type: IconType.yigeyuefen,
                    className: "text-orange-500",
                    useSvg: false
                },
                children: []
            },
            {
                title: "十一月",
                id: 'shiyiyue',
                icon: {
                    type: IconType.yigeyuefen,
                    className: "text-orange-500",
                    useSvg: false
                },
                children: []
            },
            {
                title: "十二月",
                id: 'shieryue',
                icon: {
                    type: IconType.yigeyuefen,
                    className: "text-orange-500",
                    useSvg: false
                },
                children: []
            }
        ]
    },
    {
        title: "假勤申请",
        id: 'leaveApply',
        icon: {
            type: IconType.jiaqinshenqing,
            className: "",
            useSvg: true
        },
        children: [
            {
                title: "换班",
                id: 'huanban',
                path: '/leaveApply/huanban',
                icon: {
                    type: IconType.huanban,
                    className: "text-lime-500",
                    useSvg: false
                },
                children: []
            },
            {
                title: "请假",
                id: 'qingjia',
                path: '/leaveApply/qingjia',
                icon: {
                    type: IconType.qingjia,
                    className: "text-lime-500",
                    useSvg: false
                },
                children: []
            },
            {
                title: "改班",
                id: 'gaiban',
                path: '/leaveApply/gaiban',
                icon: {
                    type: IconType.gaiban,
                    className: "text-lime-500",
                    useSvg: false
                },
                children: []
            },
            {
                title: "待审核",
                id: 'daishenhe',
                path: '/leaveApply/daishenhe',
                icon: {
                    type: IconType.daishenhe,
                    className: "",
                    useSvg: true
                },
                children: []
            }
        ]
    },
    {
        title: "统计",
        id: 'statistics',
        icon: {
            type: IconType.tongji,
            className: "",
            useSvg: true
        },
        children: [
            {
                title: "个人统计",
                id: 'gerentongji',
                path: '/statistics/gerentongji',
                icon: {
                    type: IconType.gerentongji,
                    className: "text-sky-600",
                    useSvg: false
                },
                children: []
            }, {
                title: "其他统计",
                id: 'qitatongji',
                icon: {
                    type: IconType.qitatongji,
                    className: "text-indigo-600",
                    useSvg: false
                },
                children: [
                    {
                        title: "休假类型",
                        id: 'xiujialeixing',
                        path: '/statistics/qitatongji/xiujialeixing',
                        icon: {
                            type: IconType.xiujialeixing,
                            className: "text-emerald-500",
                            useSvg: false
                        },
                        children: []
                    },
                ]
            }]
    },
    {
        title: "排班工具",
        id: 'scheduleTools',
        icon: {
            type: IconType.paibangongju,
            className: "",
            useSvg: true
        },
        children: [
            {
                title: "开始排班",
                id: 'start',
                path: '/scheduleTools/start',
                icon: {
                    type: IconType.kaishipaiban,
                    className: "text-pink-600",
                    useSvg: false
                },
                children: [
                    {
                        title: "清空排班",
                        id: 'qingkongpaiban',
                        icon: {
                            type: IconType.qingkongpaiban,
                            className: "",
                            useSvg: true
                        },
                        children: []
                    }, {
                        title: "核查排班",
                        id: 'hechapaiban',
                        icon: {
                            type: IconType.hechapaiban,
                            className: "text-green-600",
                            useSvg: false
                        },
                        children: []
                    }, {
                        title: "提交排班",
                        id: 'tijiaopaiban',
                        icon: {
                            type: IconType.tijiaopaiban,
                            className: "",
                            useSvg: true
                        },
                        children: []
                    }, {
                        title: "审核排班",
                        id: 'shenhepaiban',
                        icon: {
                            type: IconType.shenhepaiban,
                            className: "",
                            useSvg: true
                        },
                        children: []
                    }, {
                        title: "导出排班",
                        id: 'daochupaiban',
                        icon: {
                            type: IconType.daochupaiban,
                            className: "text-teal-600",
                            useSvg: false
                        },
                        children: []
                    }]
            },
            {
                title: "假期设置",
                id: 'holidaySettings',
                path: '/scheduleTools/holidaySettings',
                icon: {
                    type: IconType.jiaqishezhi,
                    className: "text-pink-600",
                    useSvg: false
                },
                children: [
                    {
                        title: "批量设置",
                        id: "piliangshezhi",
                        icon: {
                            type: IconType.piliangshezhi,
                            className: "text-blue-800",
                            useSvg: false
                        },
                        children: []
                    }
                ]
            }
        ]
    }
]
