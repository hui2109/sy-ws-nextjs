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

export enum ScheduleStatus {
    PUBLISHED = "已发布",
    PENDING_REVIEW = "待审核",
    DRAFT = "草稿",
    NODATA = '无数据'
}

export enum ApplyStatus {
    APPROVED = "已批准",
    REJECTED = "已拒绝",
    PENDING_REVIEW = "待审核",
    SUBMITTED = "已提交",
}

export const BanNamesForExcludePartner = ['休息'];

export const PSPrefix = 'syfl'
