import {Dayjs} from "dayjs";
import getDatesBetween from "@/components/utils/getDatesBetween";
import {Badge, Select, Table, TableColumnsType} from "antd";
import NullText from "@/components/others/NullText";
import {filteredRelaxBanNames} from "@/components/utils/filteredRelaxBanNames";

interface ILeaveApplyChangeScheduleTable {
    personDateBansMap: Record<string, Record<string, [string, number][]>>,
    banTypeColorMap: Record<string, string>,
    dateRange: [Dayjs, Dayjs],
    targetStaff: string,
    validBanNames: string[]
}

export default function LeaveApplyChangeScheduleTable({personDateBansMap, banTypeColorMap, dateRange, targetStaff, validBanNames}: ILeaveApplyChangeScheduleTable) {
    const daysInRange = getDatesBetween(dateRange[0], dateRange[1]);

    const dataSource = daysInRange.map(day => {
        const format_date = day.format('YYYY-MM-DD');
        return {
            key: format_date,
            dt: format_date,
            myBan: personDateBansMap[targetStaff]?.[format_date],
        }
    });

    const columns: TableColumnsType = [
        {
            title: '日期',
            dataIndex: 'dt',
        },
        {
            title: `${targetStaff} 应该上`,
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
            title: '改成',
            render: () => {
                return (
                    <Select
                        placeholder="选择排班..."
                        // value={leaveApplyType}
                        // onChange={value => setLeaveApplyType(value)}
                        options={filteredRelaxBanNames(validBanNames, ['补假']).map(banName => ({
                            label: banName,
                            value: banName,
                        }))}
                        style={{width: 150}}
                        classNames={{popup: {listItem: 'text-center'}}}
                    />
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