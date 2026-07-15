'use client';

import getAllRules from "@/api/VacationRule/getAllRules";
import React, {Dispatch, SetStateAction, useEffect, useMemo, useState} from "react";
import {Badge, Checkbox, Popconfirm, Space} from "antd";
import type {ColumnType} from 'antd/es/table';
import dayjs from "dayjs";
import {getValidStaff} from "@/api/Person/getValidStaff";
import getValidBanNames from "@/api/BanType/getValidBanNames";
import deleteRule from "@/api/VacationRule/deleteRule";
import {useAppContext} from "@/components/hooks/AppProvider";
import {getBanTypeColorMap} from "@/api/BanType/getBanTypeColorMap";

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

export default function useHSTableData(showHiddenRules: boolean) {
    const [ruleData, setRuleData] = useState<IRuleData []>([]);
    const [loading, setLoading] = useState(true);
    const [validStaffs, setValidStaffs] = useState<Array<string>>([]);
    const [validBanNames, setValidBanNames] = useState<Array<string>>([]);
    const [banTypeColorMap, setBanTypeColorMap] = useState<Record<string, string>>({});

    useEffect(() => {
        let isMounted = true;

        getAllRules(showHiddenRules).then(rules => {
            if (isMounted) {
                setRuleData(sortRuleData(rules));
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
            getValidStaff(),
            getValidBanNames(),
            getBanTypeColorMap(),
        ]).then(([validStaffs, validBanNames, banTypeColorMap]) => {
            if (isMounted) {
                setValidStaffs(validStaffs);
                setValidBanNames(validBanNames.filter(banName => banName.endsWith('假') && !['补假', '调休假'].includes(banName)));
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
        const filtersSetObj = {
            name_set: new Set<string>(),
            banName_set: new Set<string>(),
            startDate_set: new Set<string>(),
            endDate_set: new Set<string>(),
            enabled_set: new Set<boolean>(),
        }
        ruleData.forEach((dt) => {
            filtersSetObj.name_set.add(dt.name);
            filtersSetObj.banName_set.add(dt.banName);
            filtersSetObj.startDate_set.add(dt.startDate);
            filtersSetObj.endDate_set.add(dt.endDate);
            filtersSetObj.enabled_set.add(dt.enabled);
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
                editable: true,
            },
            {
                title: '假期类型',
                dataIndex: 'banName',
                filters: Array.from(filtersSetObj.banName_set).map((text) => ({value: text, text: text})),
                onFilter: (value, record) => record.banName.indexOf(value as string) === 0,
                editable: true,
                render: (value) => (
                    <Badge
                        count={value}
                        color={banTypeColorMap[value]}
                        classNames={{indicator: '!rounded-lg !font-bold'}}
                    />
                )
            },
            {
                title: '开始日期',
                dataIndex: 'startDate',
                filters: Array.from(filtersSetObj.startDate_set).map((text) => ({value: text, text: text})),
                onFilter: (value, record) => record.startDate.indexOf(value as string) === 0,
                editable: true,
            },
            {
                title: '结束日期',
                dataIndex: 'endDate',
                filters: Array.from(filtersSetObj.endDate_set).map((text) => ({value: text, text: text})),
                onFilter: (value, record) => record.endDate.indexOf(value as string) === 0,
                editable: true,
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
                editable: true,
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
                            setRuleData(prev => prev.map(item => {
                                if (item.key === record.key) {
                                    return {...item, enabled: e.target.checked, hasModified: true};
                                }
                                return item;
                            }))
                        }}
                    />
                )
            },
            {
                title: '操作',
                render: (value: IRuleData) => <Operations value={value} setRuleData={setRuleData}/>,
            },
        ];
    }, [ruleData, banTypeColorMap]);

    const renderedColumns = useMemo(() => {
        const handleSave = (row: IRuleData) => {
            setRuleData(prev =>
                prev.map(item => item.key === row.key ? {...item, ...row} : item)
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
                    record, validStaffs, validBanNames, handleSave
                }),
            };
        });
    }, [columns, validStaffs, validBanNames]);

    return {ruleData, renderedColumns, loading};
}

function Operations({value, setRuleData}: { value: IRuleData, setRuleData: Dispatch<SetStateAction<IRuleData[]>> }) {
    const {notification} = useAppContext();
    const handleDelete = (value: IRuleData) => {
        deleteRule(value.key).then(() => {
            setRuleData(prev =>
                prev.filter(item => item.key !== value.key)
            );
            notification.warning({
                title: '假期规则已删除',
                description: `${value.name} 的 ${value.banName} 规则 (${value.startDate}至${value.endDate} ${value.available_days} 天) 已删除!`
            })
        })
    }

    return (
        <Space size="medium">
            <Popconfirm title="确定要删除吗? (不可撤销!)" onConfirm={() => handleDelete(value)} okButtonProps={{color: 'danger', variant: 'solid'}}>
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
        const enabledCmp = Number(b.enabled) - Number(a.enabled); // descending: 1 before 0
        if (enabledCmp !== 0) return enabledCmp;
        const nameCmp = String(a.name).localeCompare(String(b.name), 'zh-CN', {sensitivity: 'base'});
        if (nameCmp !== 0) return nameCmp;
        return String(a.banName).localeCompare(String(b.banName), 'zh-CN', {sensitivity: 'base'});
    });
}