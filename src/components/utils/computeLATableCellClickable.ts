import dayjs, {Dayjs} from "dayjs";

export default function computeLATableCellClickable(clicked_date: Dayjs): boolean {
    const halfYearStart = clicked_date.startOf("year").month(clicked_date.month() < 6 ? 0 : 6);

    // 按示例：上半年从前一年12月15日开放，下半年从当年6月15日开放。
    const clickableFrom = halfYearStart.subtract(1, "month").date(15);

    // 按日期比较，开放当天即可点击，已开放的半年保持可点击。
    return !dayjs().isBefore(clickableFrom, "day");
}
