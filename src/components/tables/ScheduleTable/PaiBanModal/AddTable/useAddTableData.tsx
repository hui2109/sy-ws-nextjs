import React, {useContext, useEffect, useState} from "react";
import {Badge, Checkbox, InputNumber, Select, TableColumnsType} from "antd";
import NullText from "@/components/utils/NullText";
import {getBanTypeColorMap} from "@/api/BanType/getBanTypeColorMap";
import getValidBanNames from "@/api/BanType/getValidBanNames";
import creactWSRecord from "@/api/WorkSchedule/creactWSRecord";
import {useMenuContext} from "@/components/hooks/MenuContext";
import {deleteWSRecord} from "@/api/WorkSchedule/deleteWSRecord";
import {SelectedCellContext} from "@/components/hooks/SelectedCellContext";

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
    const [duplicateCheck, setDuplicateCheck] = useState(false);
    const [loading, setLoading] = useState(true);
    const {selectedCell} = useContext(SelectedCellContext);

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
                                />
                            ))}
                        </div>
                    );
                }
                return <Duplicate text={data}/>;
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
                />
            ),
        },
    ];

    return {dataSource, columns, loading};
}

function Duplicate({text}: { text: string }) {
    return (
        <Checkbox>
            {text + ' '}
            <InputNumber
                mode='spinner'
                min={2}
                max={10}
                defaultValue={5}
                style={{width: 100}}
                size='small'
            />
            {' 次'}
        </Checkbox>
    );
}

function SelectBan({placeholder, validBanNames, banTypeColorMap}: {
    placeholder: string;
    validBanNames: string[];
    banTypeColorMap: Record<string, string>;
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
    const {notification} = useMenuContext();
    const {selectedCell, setSelectedCell} = useContext(SelectedCellContext);
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
                creactWSRecord(format_date, selectedCell.name, value).then(() => {
                    setSelectedCell((prev) => {
                        const bans = new Set(prev.bans ?? []);
                        bans.add(value);
                        return {...prev, bans: Array.from(bans)};
                    });
                    setSelectedValue(null);
                    notification.success({
                        title: '排班已保存',
                        description: `${selectedCell.name} 的 ${format_date} 的 ${value} 排班已保存!`
                    });
                });
            }}
        />
    );
}

function ClickableBadge({banName, banTypeColorMap}: {
    banName: string;
    banTypeColorMap: Record<string, string>;
}) {
    const {selectedCell, setSelectedCell} = useContext(SelectedCellContext);
    const format_date = selectedCell.day.format('YYYY-MM-DD');
    const {notification} = useMenuContext();

    return (
        <Badge
            key={banName}
            count={banName}
            color={banTypeColorMap[banName]}
            classNames={{indicator: '!rounded-lg !font-bold cursor-pointer'}}
            onClick={() => {
                deleteWSRecord(format_date, banName, selectedCell.name).then(() => {
                    setSelectedCell((prev) => {
                        const bans = new Set(prev.bans ?? []);
                        bans.delete(banName);
                        return {...prev, bans: Array.from(bans)};
                    });
                    notification.warning({
                        title: '排班已删除',
                        description: `${selectedCell.name} 的 ${format_date} 的 ${banName} 排班已删除!`
                    });
                });
            }}
        />
    );
}
