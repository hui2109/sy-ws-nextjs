import dayjs, {Dayjs} from "dayjs";
import getDatesBetween from "@/components/utils/getDatesBetween";
import {Badge, Table, TableColumnsType} from "antd";
import NullText from "@/components/others/NullText";
import {useAppContext} from "@/components/hooks/AppProvider";
import {sortBanTypeList} from "@/components/utils/sortBanTypeList";

interface ILeaveApplyShiftScheduleTable {
    personDateBansMap: Record<string, Record<string, [string | null, number][]>>,
    banTypeColorMap: Record<string, string>,
    dateRange: [Dayjs, Dayjs],
    names: [string, string],
}

export default function LeaveApplyShiftScheduleTable({personDateBansMap, banTypeColorMap, dateRange, names}: ILeaveApplyShiftScheduleTable) {
    const {resolvedTheme, resolvedViewport} = useAppContext();
    const isDark = resolvedTheme === 'dark';
    const daysInRange = getDatesBetween(dateRange[0], dateRange[1]);

    const dataSource = daysInRange.map(day => {
        const format_date = day.format('YYYY-MM-DD');
        return {
            key: format_date,
            dt: format_date,
            myBan: personDateBansMap[names[0]]?.[format_date],
            hisBan: personDateBansMap[names[1]]?.[format_date]
        }
    });

    const renderBansBadge = (bans: [string, number][] | undefined) => {
        if (!bans) return <NullText/>;
        const banNames = sortBanTypeList(bans.map(ban => ban[0]));
        return (
            <div className="flex flex-col items-center justify-center gap-1.5">
                {banNames.map((banName) => (
                    <Badge
                        key={banName}
                        count={banName}
                        color={banTypeColorMap[banName]}
                        classNames={{indicator: '!rounded-lg !font-bold cursor-pointer'}}
                    />
                ))}
            </div>
        );
    };

    const columns: TableColumnsType = [
        {
            title: '日期',
            dataIndex: 'dt',
            width: resolvedViewport === 'mobile' ? 100 : 180,
            render: (date: string) => (
                <span className="font-medium tabular-nums">{
                    resolvedViewport === 'mobile' ? dayjs(date).format('YY/M/D') : date
                }</span>
            ),
        },
        {
            title: `${names[0]} 的班`,
            dataIndex: 'myBan',
            width: resolvedViewport === 'mobile' ? 100 : 240,
            render: renderBansBadge,
        },
        {
            title: `${names[1]} 的班`,
            dataIndex: 'hisBan',
            width: resolvedViewport === 'mobile' ? 100 : 240,
            render: renderBansBadge,
        },
    ];

    return (
        <div className={`overflow-hidden rounded-2xl border shadow-sm transition-colors max-desktop:rounded-xl ${
            isDark
                ? 'border-slate-700/80 bg-slate-900/70 shadow-black/20'
                : 'border-slate-200 bg-white shadow-slate-200/70'
        }`}>
            <div className={`flex justify-between items-center gap-2 border-b px-4 py-3.5
                max-desktop:flex-col max-desktop:items-start max-desktop:px-2 max-desktop:py-2 ${
                isDark
                    ? 'border-slate-700/80 bg-slate-800/80'
                    : 'border-slate-200 bg-slate-50/90'
            }`}>
                <div className="border-l-4 border-blue-500 pl-3">
                    <h3 className={`text-base font-semibold ${
                        isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}>
                        换班明细
                    </h3>
                    <p className={`mt-0.5 text-xs ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                        核对您与 {names[1]} 在所选日期范围内的排班
                    </p>
                </div>
                <div className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${
                    isDark
                        ? 'border-slate-600 text-slate-300'
                        : 'border-slate-300 text-slate-600'
                }`}>
                    共 {daysInRange.length} 天
                </div>
            </div>
            <Table
                column={{align: "center"}}
                columns={columns}
                dataSource={dataSource}
                scroll={{x: 'max-content', y: 'calc(100dvh - 400px)'}}
                pagination={false}
                size={resolvedViewport === 'mobile' ? 'small' : "middle"}
                bordered
                className={`overflow-hidden rounded-xl p-4
                max-desktop:p-0 max-desktop:!rounded-none
                    ${isDark
                    ? '[&_.ant-table]:!bg-slate-900/30 [&_.ant-table-thead_.ant-table-cell]:!bg-slate-800/80 [&_.ant-table-tbody_.ant-table-cell]:!bg-slate-900/30 [&_.ant-table-cell]:!border-slate-700/80 [&_.ant-table-tbody>tr:hover>td]:!bg-slate-800/70'
                    : '[&_.ant-table]:!bg-white [&_.ant-table-thead_.ant-table-cell]:!bg-slate-50 [&_.ant-table-tbody_.ant-table-cell]:!bg-white [&_.ant-table-cell]:!border-slate-200 [&_.ant-table-tbody>tr:hover>td]:!bg-slate-50'
                }`}
                classNames={{
                    header: {cell: 'max-desktop:!p-1'}
                }}
            />
        </div>
    );
}
