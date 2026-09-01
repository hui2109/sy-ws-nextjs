import {LeaveApplyStatus, LeaveApplyType, ScheduleStatus} from "@/prisma/generated/enums";

export const AppName = "放疗排班";
export const Weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
export const LatterBantype = ['OAE', 'OAF',
    'OBE', 'OBF',
    'OCE', 'OCF',
    'T1A', 'T1B',
    'T2A', 'T2B',
    'T3A', 'T3B',
    '事假', '病假', '丧假', '婚假', '产假', '陪产假', '育儿假', '其他假',
    '补假', '休息']
export const BanNamesForExcludePartner = ['休息'];
export const PSPrefix = 'syfl'

export const ScheduleStatusMap = {
    PUBLISHED: "已发布",
    PENDING_REVIEW: "待审核",
    DRAFT: "草稿",
    NODATA: '无数据'
} satisfies Record<ScheduleStatus, string>;
export const leaveApplyTypeMap = {
    SHIFT_SCHEDULE: '换班',
    ASKOFF: '请假',
    CHANGE_SCHEDULE: '改班',
} as const satisfies Record<LeaveApplyType, string>;
export const leaveApplyStatusMap = {
    APPROVED: '已通过',
    REJECTED: '已退回',
    PENDING_REVIEW: '待审核',
    DRAFT: '草稿',
} as const satisfies Record<LeaveApplyStatus, string>;
export const leaveApplyTypeColorMap = {
    SHIFT_SCHEDULE: 'volcano',
    ASKOFF: 'blue',
    CHANGE_SCHEDULE: 'purple',
} satisfies Record<LeaveApplyType, string>;
export const leaveApplyStatusColorMap = {
    APPROVED: 'green',
    REJECTED: 'magenta',
    PENDING_REVIEW: 'orange',
    DRAFT: 'geekblue',
} satisfies Record<LeaveApplyStatus, string>;