import React, {Dispatch, SetStateAction, useState} from "react";
import {Badge, Select, TableColumnsType} from "antd";
import NullText from "@/components/utils/NullText";
import {getBanTypeColorMap} from "@/api/BanType/getBanTypeColorMap";
import getValidBanNames from "@/api/BanType/getValidBanNames";
import {IScheduleCellInfo} from "@/components/tables/ScheduleTable/getScheduleTableData";
import creactWSRecord from "@/api/WorkSchedule/creactWSRecord";
import {useMenuContext} from "@/components/hooks/MenuContext";
import {deleteWSRecord} from "@/api/WorkSchedule/deleteWSRecord";

export interface IAddTableData {
    dataSource: {
        key: string,
        already: string[] | undefined | string,
        suggestion?: string,
        newBan?: string
    }[],
    columns: TableColumnsType
}

export default async function getAddTableData(selectedCell: IScheduleCellInfo, setSelectedCell: Dispatch<SetStateAction<IScheduleCellInfo>>): Promise<IAddTableData> {
    const banTypeColorMap = await getBanTypeColorMap();
    const validBanNames = await getValidBanNames();
    const dataSource = [{
        key: '1',
        already: selectedCell.bans,
        suggestion: '',
        newBan: '请选择...'
    }, {
        key: '2',
        already: '重复',
    }];

    const columns: TableColumnsType = [
        {
            title: '已有排班',
            dataIndex: 'already',
            onCell: (_, index: number | undefined) => ({
                colSpan: index === 1 ? 3 : 1,
            }),
            render: (data: string[] | string | undefined) => {
                if (!data || data.length === 0) {
                    return <NullText/>
                }

                if (Array.isArray(data)) {
                    return (
                        <div className='flex flex-col justify-center items-center gap-2'>
                            {data.map((item: string) => (
                                <ClickableBadge
                                    key={item}
                                    banName={item}
                                    banTypeColorMap={banTypeColorMap}
                                    selectedCell={selectedCell}
                                    setSelectedCell={setSelectedCell}
                                />
                            ))}
                        </div>
                    )
                } else {
                    return (
                        <div>{data}</div>
                    )
                }
            }
        }, {
            title: '建议排班',
            dataIndex: 'suggestion',
            onCell: (_, index: number | undefined) => ({
                colSpan: index === 1 ? 0 : 1,  // 合并时隐藏
            }),
            render: () => <NullText/>
        },
        {
            title: '新增排班',
            dataIndex: 'newBan',
            onCell: (_, index: number | undefined) => ({
                colSpan: index === 1 ? 0 : 1,  // 合并时隐藏
            }),
            render: (text: string) => <SelectBan
                placeholder={text}
                validBanNames={validBanNames}
                banTypeColorMap={banTypeColorMap}
                selectedCell={selectedCell}
                setSelectedCell={setSelectedCell}
            />,
        },
    ];

    return {
        dataSource,
        columns
    }
}

function SelectBan({placeholder, validBanNames, banTypeColorMap, selectedCell, setSelectedCell}:
                   {
                       placeholder: string;
                       validBanNames: string[];
                       banTypeColorMap: Record<string, string>;
                       selectedCell: IScheduleCellInfo;
                       setSelectedCell: Dispatch<SetStateAction<IScheduleCellInfo>>
                   }) {
    const options = validBanNames.map((item: string) => {
        return {
            label: (
                <Badge
                    count={item}
                    color={banTypeColorMap[item]}
                    classNames={{indicator: '!rounded-lg !font-bold'}}
                />
            ),
            value: item,
        }
    });
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const {notification} = useMenuContext();
    const format_date = selectedCell.day.format('YYYY-MM-DD');

    return (
        <Select
            value={selectedValue}
            showSearch={{
                optionFilterProp: 'value',
                filterSort: (optionA, optionB) =>
                    (optionA?.value ?? '').toLowerCase().localeCompare((optionB?.value ?? '').toLowerCase()),
            }}
            style={{width: 100}}
            placeholder={placeholder}
            options={options}
            classNames={{
                popup: {
                    listItem: 'text-center'
                }
            }}
            onChange={(value) => {
                creactWSRecord(format_date, selectedCell.name, value).then(() => {
                    setSelectedCell((prev) => {
                        const bans = new Set(prev.bans ?? []);
                        bans.add(value);
                        return {
                            ...prev,
                            bans: Array.from(bans),
                        };
                    });
                    setSelectedValue(null);
                    notification.success({title: '排班已保存', description: `${selectedCell.name} 的 ${format_date} 的 ${value} 排班已保存!`})
                });
            }}
        />
    )
}

function ClickableBadge({banName, banTypeColorMap, selectedCell, setSelectedCell}:
                        {
                            banName: string;
                            banTypeColorMap: Record<string, string>;
                            selectedCell: IScheduleCellInfo;
                            setSelectedCell: Dispatch<SetStateAction<IScheduleCellInfo>>
                        }) {
    const format_date = selectedCell.day.format('YYYY-MM-DD');
    const {notification} = useMenuContext();

    return <Badge
        key={banName}
        count={banName}
        color={banTypeColorMap[banName]}
        classNames={{indicator: '!rounded-lg !font-bold cursor-pointer'}}
        onClick={() => {
            deleteWSRecord(format_date, banName, selectedCell.name).then(() => {
                setSelectedCell((prev) => {
                    const bans = new Set(prev.bans ?? []);
                    bans.delete(banName);
                    return {
                        ...prev,
                        bans: Array.from(bans),
                    };
                });
                notification.warning({title: '排班已删除', description: `${selectedCell.name} 的 ${format_date} 的 ${banName} 排班已删除!`})
            })
        }}
    />
}