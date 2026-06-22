export const AppName = "省医电离排班站";
export const Weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
export const LatterBantype = ['OAE', 'OAF', 'OBE', 'OBF', 'OCE', 'OCF', '补假', 'T1A', 'T1B', 'T2A', 'T2B', 'T3A', 'T3B']

export enum ScheduleStatus {
    PUBLISHED = "已发布",
    PENDING_REVIEW = "待审核",
    DRAFT = "草稿",
}

export enum ApplyStatus {
    APPROVED = "已批准",
    REJECTED = "已拒绝",
    PENDING_REVIEW = "待审核",
    SUBMITTED = "已提交",
}
