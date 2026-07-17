import {ScheduleStatus} from "@/configs/general";
import {Badge} from "antd";

export function getMonthStatusBadge(monthStatus: string) {
    const monthStatusColorMap: Record<string, string> = {
        [ScheduleStatus.NODATA]: '#5810db',
        [ScheduleStatus.DRAFT]: '#f5222d',
        [ScheduleStatus.PENDING_REVIEW]: '#faad14',
        [ScheduleStatus.PUBLISHED]: '#52c41a',
    };

    return (
        <Badge
            count={monthStatus}
            color={monthStatusColorMap[monthStatus] ?? 'blue'}
            classNames={{indicator: '!rounded-lg !font-bold !text-[14px]'}}
            size='medium'
        />
    );
}