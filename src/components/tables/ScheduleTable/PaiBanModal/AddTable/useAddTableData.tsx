import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import {Badge, Checkbox, InputNumber, Select, TableColumnsType} from "antd";
import NullText from "@/components/utils/NullText";
import {getBanTypeColorMap} from "@/api/BanType/getBanTypeColorMap";
import getValidBanNames from "@/api/BanType/getValidBanNames";
import creactWSRecord from "@/api/WorkSchedule/creactWSRecord";
import {useAppContext} from "@/components/hooks/AppProvider";
import {deleteWSRecord} from "@/api/WorkSchedule/deleteWSRecord";
import {useSelectedCellContext} from "@/components/hooks/SelectedCellContext";

export interface IAddTableData {
    dataSource: {
        key: string,
        already: string[] | undefined | string,
        suggestion?: string,
        newBan?: string
    }[],
    columns: TableColumnsType,
    loading: boolean
}

export default function useAddTableData(): IAddTableData {
    const [banTypeColorMap, setBanTypeColorMap] = useState<Record<string, string>>({});
    const [validBanNames, setValidBanNames] = useState<string[]>([]);
    const [duplicateCheck, setDuplicateCheck] = useState(true);
    const [duplicateNum, setDuplicateNum] = useState(5);
    const [loading, setLoading] = useState(true);
    const {selectedCell} = useSelectedCellContext();

    useEffect(() => {
        Promise.all([getBanTypeColorMap(), getValidBanNames()])
            .then(([colorMap, banNames]) => {
                setBanTypeColorMap(colorMap);
                setValidBanNames(banNames);
            })
            .finally(() => setLoading(false));
    }, []);

    const dataSource = [
        {
            key: '1',
            already: selectedCell.bans,
            suggestion: '',
            newBan: '请选择...'
        },
        {
            key: '2',
            already: '重复',
        }
    ];

    const columns: TableColumnsType = [
        {
            title: '已有排班',
            dataIndex: 'already',
            onCell: (_, index: number | undefined) => ({
                colSpan: index === 1 ? 3 : 1,
            }),
            render: (data: string[] | string | undefined) => {
                if (!data || data.length === 0) {
                    return <NullText/>;
                }
                if (Array.isArray(data)) {
                    return (
                        <div className='flex flex-col justify-center items-center gap-2'>
                            {data.map((item: string) => (
                                <ClickableBadge
                                    key={item}
                                    banName={item}
                                    banTypeColorMap={banTypeColorMap}
                                    duplicateCheck={duplicateCheck}
                                    duplicateNum={duplicateNum}
                                />
                            ))}
                        </div>
                    );
                }
                return <Duplicate
                    text={data}
                    duplicateCheck={duplicateCheck}
                    duplicateNum={duplicateNum}
                    setDuplicateCheck={setDuplicateCheck}
                    setDuplicateNum={setDuplicateNum}
                />;
            }
        },
        {
            title: '建议排班',
            dataIndex: 'suggestion',
            onCell: (_, index: number | undefined) => ({
                colSpan: index === 1 ? 0 : 1,
            }),
            render: () => <NullText/>
        },
        {
            title: '新增排班',
            dataIndex: 'newBan',
            onCell: (_, index: number | undefined) => ({
                colSpan: index === 1 ? 0 : 1,
            }),
            render: (text: string) => (
                <SelectBan
                    placeholder={text}
                    validBanNames={validBanNames}
                    banTypeColorMap={banTypeColorMap}
                    duplicateCheck={duplicateCheck}
                    duplicateNum={duplicateNum}
                />
            ),
        },
    ];

    return {dataSource, columns, loading};
}

function Duplicate({text, duplicateCheck, duplicateNum, setDuplicateCheck, setDuplicateNum}: {
    text: string;
    duplicateCheck: boolean;
    duplicateNum: number;
    setDuplicateCheck: Dispatch<SetStateAction<boolean>>;
    setDuplicateNum: Dispatch<SetStateAction<number>>;
}) {
    return (
        <div className='flex items-center justify-center gap-2'>
            <Checkbox
                checked={duplicateCheck}
                onChange={(e) => setDuplicateCheck(e.target.checked)}
            >
                {text}
            </Checkbox>
            <InputNumber
                value={duplicateNum}
                onChange={(value) => setDuplicateNum(value ?? 5)}
                mode='spinner'
                min={2}
                max={10}
                style={{width: 100}}
                size='small'
                disabled={!duplicateCheck}
            />
            <span>次</span>
        </div>
    );
}


function SelectBan({placeholder, validBanNames, banTypeColorMap, duplicateCheck, duplicateNum}: {
    placeholder: string;
    validBanNames: string[];
    banTypeColorMap: Record<string, string>;
    duplicateCheck: boolean;
    duplicateNum: number;
}) {
    const options = validBanNames.map((item: string) => ({
        label: (
            <Badge
                count={item}
                color={banTypeColorMap[item]}
                classNames={{indicator: '!rounded-lg !font-bold'}}
            />
        ),
        value: item,
    }));

    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const {notification} = useAppContext();
    const {selectedCell, setSelectedCell} = useSelectedCellContext();
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
            classNames={{popup: {listItem: 'text-center'}}}
            onChange={(value) => {
                const dates = duplicateCheck
                    ? Array.from({length: duplicateNum}, (_, i) =>
                        selectedCell.day.add(i, 'day').format('YYYY-MM-DD'))
                    : [format_date];

                dates.forEach((date, i) =>
                    creactWSRecord(date, selectedCell.name, value).then(() => {
                        if (i !== 0) return;
                        setSelectedCell((prev) => {
                            const bans = new Set(prev.bans ?? []);
                            bans.add(value);
                            return {...prev, bans: Array.from(bans)};
                        });
                        setSelectedValue(null);
                        notification.success({
                            title: '排班已保存',
                            description: dates.length === 1
                                ? `${selectedCell.name} 的 ${dates[0]} 的 ${value} 排班已保存!`
                                : `${selectedCell.name} 的 ${dates[0]} 至 ${dates.at(-1)} 的 ${value} 排班已保存!`
                        });
                    })
                );
            }}
        />
    );
}

function ClickableBadge({banName, banTypeColorMap, duplicateCheck, duplicateNum}: {
    banName: string;
    banTypeColorMap: Record<string, string>;
    duplicateCheck: boolean;
    duplicateNum: number;
}) {
    const {selectedCell, setSelectedCell} = useSelectedCellContext();
    const format_date = selectedCell.day.format('YYYY-MM-DD');
    const {notification} = useAppContext();

    return (
        <Badge
            key={banName}
            count={banName}
            color={banTypeColorMap[banName]}
            classNames={{indicator: '!rounded-lg !font-bold cursor-pointer'}}
            onClick={() => {
                const dates = duplicateCheck
                    ? Array.from({length: duplicateNum}, (_, i) =>
                        selectedCell.day.add(i, 'day').format('YYYY-MM-DD'))
                    : [format_date];

                dates.forEach((date, i) =>
                    deleteWSRecord(date, banName, selectedCell.name).then(() => {
                        if (i !== 0) return;
                        setSelectedCell((prev) => {
                            const bans = new Set(prev.bans ?? []);
                            bans.delete(banName);
                            return {...prev, bans: Array.from(bans)};
                        });
                        notification.warning({
                            title: '排班已删除',
                            description: dates.length === 1
                                ? `${selectedCell.name} 的 ${dates[0]} 的 ${banName} 排班已删除!`
                                : `${selectedCell.name} 的 ${dates[0]} 至 ${dates.at(-1)} 的 ${banName} 排班已删除!`
                        });
                    })
                );
            }}

        />
    );
}
