import {Dayjs} from "dayjs";
import getDatesBetween from "@/components/utils/getDatesBetween";
import {Badge, Table, TableColumnsType} from "antd";
import NullText from "@/components/others/NullText";

interface ILeaveApplyShiftScheduleTable {
    personDateBansMap: Record<string, Record<string, [string, number][]>>,
    banTypeColorMap: Record<string, string>,
    dateRange: [Dayjs, Dayjs],
    names: [string, string],
}

export default function LeaveApplyShiftScheduleTable({personDateBansMap, banTypeColorMap, dateRange, names}: ILeaveApplyShiftScheduleTable) {
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

    const columns: TableColumnsType = [
        {
            title: '日期',
            dataIndex: 'dt',
        },
        {
            title: '我的班',
            dataIndex: 'myBan',
            render: (bans: [string, number][] | undefined) => {
                if (!bans) return <NullText/>;
                return (
                    <div className='flex flex-col justify-center items-center gap-2'>
                        {bans.map((ban: [string, number]) => (
                            <Badge
                                key={ban[0]}
                                count={ban[0]}
                                color={banTypeColorMap[ban[0]]}
                                classNames={{indicator: '!rounded-lg !font-bold cursor-pointer'}}
                            />
                        ))}
                    </div>
                )
            }
        },
        {
            title: `${names[1]} 的班`,
            dataIndex: 'hisBan',
            render: (bans: [string, number][] | undefined) => {
                if (!bans) return <NullText/>;
                return (
                    <div className='flex flex-col justify-center items-center gap-2'>
                        {bans.map((ban: [string, number]) => (
                            <Badge
                                key={ban[0]}
                                count={ban[0]}
                                color={banTypeColorMap[ban[0]]}
                                classNames={{indicator: '!rounded-lg !font-bold cursor-pointer'}}
                            />
                        ))}
                    </div>
                )
            }
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={dataSource}
            scroll={{x: 'max-content', y: 750}}
            pagination={false}
            title={() => ''}
            footer={() => ''}
            column={{align: 'center'}}
            size={'small'}
            bordered
            classNames={{
                footer: '!p-2',
                title: '!p-3',
            }}
        />
    )
}