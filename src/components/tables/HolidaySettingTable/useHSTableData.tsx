'use client';

import getAllRules from "@/api/VacationRule/getAllRules";
import React, {Dispatch, SetStateAction, useEffect, useMemo, useState} from "react";
import {Badge, Checkbox, Popconfirm, Space, TableProps} from "antd";
import type {ColumnType} from 'antd/es/table';
import dayjs from "dayjs";
import getValidBanNames from "@/api/BanType/getValidBanNames";
import deleteRule from "@/api/VacationRule/deleteRule";
import {useAppContext} from "@/components/hooks/AppProvider";
import {getBanTypeColorMap} from "@/api/BanType/getBanTypeColorMap";
import {filteredRelaxBanNames} from "@/components/utils/filteredRelaxBanNames";

export interface IRuleData {
    key: number
    id: number
    name: string
    banName: string
    startDate: string
    endDate: string
    left_days: number
    used_days: number
    available_days: number
    enabled: boolean
    color: string
    hasModified: boolean
}

type EditableColumn = ColumnType<IRuleData> & { editable?: boolean };

export default function useHSTableData(showHiddenRules: boolean, isEditable: boolean) {
    const {currentUser} = useAppContext();
    const [ruleData, setRuleData] = useState<IRuleData [] | null>(null);
    const [loading, setLoading] = useState(true);
    const [validBanNames, setValidBanNames] = useState<Array<string> | null>(null);
    const [banTypeColorMap, setBanTypeColorMap] = useState<Record<string, string> | null>(null);
    const [nameRowSpanMap, setNameRowSpanMap] = useState<Record<number, number> | null>(null);

    useEffect(() => {
        let isMounted = true;

        getAllRules(showHiddenRules).then(rules => {
            if (isMounted) {
                const sortedRuleData = sortRuleData(rules)
                setRuleData(sortedRuleData);
                setNameRowSpanMap(computeNameRowSpanMap(sortedRuleData));
                setLoading(false);
            }
        })

        return () => {
            isMounted = false;
            setLoading(true);
        }
    }, [showHiddenRules]);

    useEffect(() => {
        let isMounted = true;

        Promise.all([
            getValidBanNames(),
            getBanTypeColorMap(),
        ]).then(([validBanNames, banTypeColorMap]) => {
            if (isMounted) {
                setValidBanNames(filteredRelaxBanNames(validBanNames));
                setBanTypeColorMap(banTypeColorMap);
                setLoading(false);
            }
        })

        return () => {
            isMounted = false;
            setLoading(true);
        }
    }, []);

    const columns: EditableColumn[] = useMemo(() => {
        if (!ruleData || !banTypeColorMap || !currentUser) {
            return [];
        }

        const filtersSetObj = {
            name_set: new Set<string>(),
            banName_set: new Set<string>(),
            startDate_set: new Set<string>(),
            endDate_set: new Set<string>(),
            enabled_set: new Set<boolean>(),
        }
        ruleData.forEach((data) => {
            filtersSetObj.name_set.add(data.name);
            filtersSetObj.banName_set.add(data.banName);
            filtersSetObj.startDate_set.add(data.startDate);
            filtersSetObj.endDate_set.add(data.endDate);
            filtersSetObj.enabled_set.add(data.enabled);
        });

        return [
            {
                title: '编号',
                render: (_value, _record, index) => index + 1
            },
            {
                title: '姓名',
                dataIndex: 'name',
                filters: Array.from(filtersSetObj.name_set).map((text) => ({value: text, text: text})),
                onFilter: (value, record) => record.name.indexOf(value as string) === 0,
                onCell: (record) => ({rowSpan: nameRowSpanMap?.[record.key]}),
                defaultFilteredValue: isEditable ? [] : [currentUser],
            },
            {
                title: '假期类型',
                dataIndex: 'banName',
                filters: Array.from(filtersSetObj.banName_set).map((text) => ({value: text, text: text})),
                onFilter: (value, record) => record.banName.indexOf(value as string) === 0,
                render: (value) => (
                    <Badge
                        count={value}
                        color={banTypeColorMap[value]}
                        classNames={{indicator: '!rounded-lg !font-bold'}}
                    />
                ),
                editable: isEditable,
            },
            {
                title: '开始日期',
                dataIndex: 'startDate',
                filters: Array.from(filtersSetObj.startDate_set).map((text) => ({value: text, text: text})),
                onFilter: (value, record) => record.startDate.indexOf(value as string) === 0,
                editable: isEditable,
            },
            {
                title: '结束日期',
                dataIndex: 'endDate',
                filters: Array.from(filtersSetObj.endDate_set).map((text) => ({value: text, text: text})),
                onFilter: (value, record) => record.endDate.indexOf(value as string) === 0,
                editable: isEditable,
            },
            {
                title: '剩余天数',
                dataIndex: 'left_days',
                sorter: (a, b) => a.left_days - b.left_days,
            },
            {
                title: '已休天数',
                dataIndex: 'used_days',
                sorter: (a, b) => a.used_days - b.used_days,
            },
            {
                title: '总天数',
                dataIndex: 'available_days',
                sorter: (a, b) => a.available_days - b.available_days,
                editable: isEditable,
            },
            {
                title: '启用?',
                dataIndex: 'enabled',
                filters: Array.from(filtersSetObj.enabled_set).map(text => ({value: text, text: text ? '已启用' : '未启用'})),
                onFilter: (value, record) => record.enabled === value,
                render: (value, record) => (
                    <Checkbox
                        checked={value}
                        onChange={e => {
                            setRuleData(prev => prev?.map(item => {
                                if (item.key === record.key) {
                                    return {...item, enabled: e.target.checked, hasModified: true};
                                }
                                return item;
                            }) ?? null)
                        }}
                        disabled={!isEditable}
                    />
                )
            },
            ...(isEditable
                ? [{
                    title: '操作',
                    render: (_value: unknown, record: IRuleData) => (
                        <Operations
                            value={record}
                            setRuleData={setRuleData}
                        />
                    ),
                }]
                : []),
        ];
    }, [ruleData, banTypeColorMap, nameRowSpanMap, isEditable, currentUser]);

    const renderedColumns = useMemo(() => {
        if (columns.length === 0 || !validBanNames) {
            return [];
        }

        const handleSave = (row: IRuleData) => {
            setRuleData(prev => {
                    if (!prev) return prev;

                    return prev.map(item => item.key === row.key ? {...item, ...row} : item)
                }
            );
        };

        return columns.map((col) => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: (record: IRuleData) => ({
                    title: col.title,
                    editable: col.editable,
                    dataIndex: col.dataIndex as keyof IRuleData,
                    record, validBanNames, handleSave
                }),
            };
        });
    }, [columns, validBanNames]);

    const onChange: TableProps<IRuleData>['onChange'] = (_pagination, _filters, sorter, extra) => {
        if (extra.action === 'filter') {
            setNameRowSpanMap(computeNameRowSpanMap(extra.currentDataSource));
            return;
        }

        if (extra.action === 'sort') {
            const isSorting = Array.isArray(sorter) ? sorter.some(item => item.order) : sorter.order;
            setNameRowSpanMap(isSorting ? null : computeNameRowSpanMap(extra.currentDataSource));
        }
    }

    return {ruleData, renderedColumns, loading, onChange};
}

function Operations({value, setRuleData}: { value: IRuleData, setRuleData: Dispatch<SetStateAction<IRuleData[] | null>> }) {
    const {notification} = useAppContext();
    const handleDelete = (value: IRuleData) => {
        deleteRule(value.key).then(() => {
            setRuleData(prev =>
                prev?.filter(item => item.key !== value.key) ?? null
            );
            notification.warning({
                title: '假期规则已删除',
                description: `${value.name} 的 ${value.banName} 规则 (${value.startDate}至${value.endDate} ${value.available_days} 天) 已删除!`
            })
        })
    }

    return (
        <Space size="medium">
            <Popconfirm title="确定要删除吗？(不可撤销！)" onConfirm={() => handleDelete(value)} okButtonProps={{color: 'danger', variant: 'solid'}}>
                <a>删除?</a>
            </Popconfirm>
        </Space>
    )
}

function sortRuleData(rules: Awaited<ReturnType<typeof getAllRules>>): IRuleData[] {
    return rules.map(rule => ({
        key: rule.id,
        id: rule.id,
        name: rule.person.name,
        banName: rule.banType.banName,
        startDate: dayjs(rule.startDate).format('YYYY-MM-DD'),
        endDate: dayjs(rule.endDate).format('YYYY-MM-DD'),
        left_days: rule.left_days,
        used_days: rule.used_days,
        available_days: rule.availableHalfDays / 2,
        enabled: !rule.isHidden,
        color: rule.banType.color,
        hasModified: false,
    })).sort((a, b) => {
        const nameCmp = String(a.name).localeCompare(String(b.name), 'zh-CN', {sensitivity: 'base'});
        if (nameCmp !== 0) return nameCmp;
        const enabledCmp = Number(b.enabled) - Number(a.enabled); // descending: 1 before 0
        if (enabledCmp !== 0) return enabledCmp;
        return String(a.banName).localeCompare(String(b.banName), 'zh-CN', {sensitivity: 'base'});
    });
}

function computeNameRowSpanMap(ruleData: IRuleData[]): Record<number, number> {
    const map: Record<number, number> = {};
    let lastName = '';
    ruleData.forEach((item) => {
        if (item.name === lastName) {
            map[item.key] = 0;
        } else {
            lastName = item.name;
            map[item.key] = ruleData.filter(d => d.name === item.name).length;
        }
    });
    return map;
}