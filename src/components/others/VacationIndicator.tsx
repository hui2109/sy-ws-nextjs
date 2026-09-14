import {get_holiday_detail} from "@/api/ChineseCalendar/utils";
import type {Dayjs} from "dayjs";
import {Tag, Tooltip} from "antd";

export default function VacationIndicator({date}: { date: Dayjs }) {
    const [onHoliday, holidayName] = get_holiday_detail(date);

    // 普通日期、普通周末不显示
    if (!holidayName) return null;

    const indicator = onHoliday ? "休" : "班";

    return (
        <Tooltip title={holidayName} color='pink'>
            <Tag
                color={onHoliday ? "green" : "blue"}
                variant='solid'
                className="!absolute !flex !items-center !justify-center !h-4 !w-4 !rounded-full !text-[10px] whitespace-nowrap
                    !font-bold !shadow-sm !z-10 !select-none !-top-3 !-right-3 !p-0 !m-0
                    max-desktop:!h-3 max-desktop:!w-3 max-desktop:!-top-0.5 max-desktop:!-right-1 max-desktop:!text-[8px] max-desktop:!leading-none"
            >
                {indicator}
            </Tag>
        </Tooltip>
    );
}
