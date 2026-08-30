import {ScheduleStatusMap} from "@/configs/general";
import {Badge} from "antd";

export function MonthStatusBadge(monthStatus: string) {
    const monthStatusColorMap: Record<string, string> = {
        [ScheduleStatusMap.NODATA]: '#5810db',
        [ScheduleStatusMap.DRAFT]: '#f5222d',
        [ScheduleStatusMap.PENDING_REVIEW]: '#faad14',
        [ScheduleStatusMap.PUBLISHED]: '#52c41a',
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