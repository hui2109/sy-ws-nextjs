import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import {Badge, Select, TableColumnsType} from "antd";
import NullText from "@/components/others/NullText";
import {getBanTypeColorMap} from "@/api/BanType/getBanTypeColorMap";
import getValidBanNames from "@/api/BanType/getValidBanNames";
import {useAppContext} from "@/components/hooks/AppProvider";
import {DuplicateCheck} from "@/components/others/DuplicateCheck";
import {IAddTableData} from "@/components/tables/ScheduleTable/PaiBanModal/AddTable/useAddTableData";
import {getBansbyDate} from "@/api/WorkSchedule/getBansbyDate";
import {useSelectedHeadContext} from "@/components/hooks/SelectedHeadContext";
import creactWSRecords from "@/api/WorkSchedule/creactWSRecords";
import {deleteWSRecords} from "@/api/WorkSchedule/deleteWSRecords";

export default function useAddTableForHeadData(): IAddTableData {
    const [banTypeColorMap, setBanTypeColorMap] = useState<Record<string, string>>({});
    const [validBanNames, setValidBanNames] = useState<string[]>([]);
    const [duplicateCheck, setDuplicateCheck] = useState(true);
    const [duplicateNum, setDuplicateNum] = useState(5);
    const [loading, setLoading] = useState(true);
    const [todayBans, setTodayBans] = useState<string[]>([]);
    const {selectedHead} = useSelectedHeadContext();

    useEffect(() => {
        let isMounted = true;

        Promise.all([getBanTypeColorMap(), getValidBanNames()])
            .then(([colorMap, banNames]) => {
                if (isMounted) {
                    setBanTypeColorMap(colorMap);
                    setValidBanNames(banNames);
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
            setLoading(true);
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        getBansbyDate(selectedHead.day.format('YYYY-MM-DD')).then(todayBans => {
            if (isMounted) {
                setTodayBans(todayBans);
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            setLoading(true);
        };
    }, [selectedHead.day]);

    const dataSource = [
        {
            key: '1',
            already: todayBans,
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
            render: (data: string[] | string) => {
                if (data.length === 0) {
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
                                    setTodayBans={setTodayBans}
                                />
                            ))}
                        </div>
                    );
                }
                return <DuplicateCheck
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
                    setTodayBans={setTodayBans}
                />
            ),
        },
    ];

    return {dataSource, columns, loading};
}

function SelectBan({placeholder, validBanNames, banTypeColorMap, duplicateCheck, duplicateNum, setTodayBans}: {
    placeholder: string;
    validBanNames: string[];
    banTypeColorMap: Record<string, string>;
    duplicateCheck: boolean;
    duplicateNum: number;
    setTodayBans: Dispatch<SetStateAction<string[]>>;
}) {
    const options = validBanNames
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .map((item: string) => ({
            label: (
                <Badge
                    count={item}
                    color={banTypeColorMap[item]}
                    classNames={{indicator: '!rounded-lg !font-bold'}}
                />
            ),
            value: item,
        }));

    const {resolvedViewport} = useAppContext();
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const {notification} = useAppContext();
    const {selectedHead} = useSelectedHeadContext();
    const format_date = selectedHead.day.format('YYYY-MM-DD');

    return (
        <Select
            value={selectedValue}
            showSearch={resolvedViewport === 'mobile' ? false : {
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
                        selectedHead.day.add(i, 'day').format('YYYY-MM-DD'))
                    : [format_date];

                dates.forEach((date, i) =>
                    creactWSRecords(date, value).then(() => {
                        if (i !== 0) return;
                        setTodayBans(prev => {
                            const bans = new Set(prev);
                            bans.add(value);
                            return [...bans];
                        });
                        setSelectedValue(null);
                        notification.success({
                            title: '排班已保存',
                            description: dates.length === 1
                                ? `所有人 的 ${dates[0]} 的 ${value} 排班已保存!`
                                : `所有人 的 ${dates[0]} 至 ${dates.at(-1)} 的 ${value} 排班已保存!`
                        });
                    })
                );
            }}
        />
    );
}

function ClickableBadge({banName, banTypeColorMap, duplicateCheck, duplicateNum, setTodayBans}: {
    banName: string;
    banTypeColorMap: Record<string, string>;
    duplicateCheck: boolean;
    duplicateNum: number;
    setTodayBans: Dispatch<SetStateAction<string[]>>;
}) {
    const {selectedHead} = useSelectedHeadContext();
    const format_date = selectedHead.day.format('YYYY-MM-DD');
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
                        selectedHead.day.add(i, 'day').format('YYYY-MM-DD'))
                    : [format_date];

                dates.forEach((date, i) =>
                    deleteWSRecords(date, banName).then(() => {
                        if (i !== 0) return;
                        setTodayBans(prev => {
                            const bans = new Set(prev);
                            bans.delete(banName);
                            return [...bans];
                        });
                        notification.warning({
                            title: '排班已删除',
                            description: dates.length === 1
                                ? `所有人 的 ${dates[0]} 的 ${banName} 排班已删除!`
                                : `所有人 的 ${dates[0]} 至 ${dates.at(-1)} 的 ${banName} 排班已删除!`
                        });
                    })
                );
            }}

        />
    );
}
