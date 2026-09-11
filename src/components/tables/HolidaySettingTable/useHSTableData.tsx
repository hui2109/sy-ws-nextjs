'use client';

import {Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState} from "react";
import type {TableProps} from "antd";
import {Badge, Checkbox, Popconfirm, Space} from "antd";
import type {ColumnType} from "antd/es/table";
import dayjs from "dayjs";
import getAllRules from "@/api/VacationRule/getAllRules";
import getValidBanNames from "@/api/BanType/getValidBanNames";
import deleteRule from "@/api/VacationRule/deleteRule";
import {getBanTypeColorMap} from "@/api/BanType/getBanTypeColorMap";
import {useAppContext} from "@/components/hooks/AppProvider";
import {filteredRelaxBanNames} from "@/components/utils/filteredRelaxBanNames";
import {useHSTableContext} from "@/components/hooks/HSTableContext";
import compareDefaultRuleData from "@/components/utils/compareDefaultRuleData";

export interface IRuleData {
    key: number;
    id: number;
    name: string;
    banName: string;
    startDate: string;
    endDate: string;
    left_days: number;
    used_days: number;
    available_days: number;
    enabled: boolean;
    hasModified: boolean;
}

type EditableColumn = ColumnType<IRuleData> & { editable?: boolean };
type TableChangeHandler = NonNullable<TableProps<IRuleData>["onChange"]>;
type AntdFilters = Parameters<TableChangeHandler>[1];
type AntdSorter = Parameters<TableChangeHandler>[2];
type FilterKey = "name" | "banName" | "startDate" | "endDate" | "enabled";
type FilterState = Partial<Record<FilterKey, AntdFilters[string]>>;
type SortKey = "left_days" | "used_days" | "available_days";
type SortOrder = "ascend" | "descend" | null;

interface SortState {
    columnKey: SortKey | null;
    order: SortOrder;
}

interface FilterOptions {
    names: Array<{ value: string; text: string }>;
    banNames: Array<{ value: string; text: string }>;
    startDates: Array<{ value: string; text: string }>;
    endDates: Array<{ value: string; text: string }>;
    enabled: Array<{ value: boolean; text: string }>;
}

const EMPTY_SORT_STATE: SortState = {columnKey: null, order: null};

export default function useHSTableData(showHiddenRules: boolean, isEditable: boolean) {
    const {currentUser} = useAppContext();
    const {refreshKey} = useHSTableContext();
    const [loading, setLoading] = useState<boolean>(true);
    const [ruleData, setRuleData] = useState<IRuleData[] | null>(null);
    const [validBanNames, setValidBanNames] = useState<string[] | null>(null);
    const [banTypeColorMap, setBanTypeColorMap] = useState<Record<string, string> | null>(null);
    const [filterState, setFilterState] = useState<FilterState>(isEditable ? {} : {name: [currentUser ?? '']});
    const [sortState, setSortState] = useState<SortState>(EMPTY_SORT_STATE);

    useEffect(() => {
        let isMounted = true;

        Promise.all([
            getValidBanNames(),
            getBanTypeColorMap(),
        ]).then(([validBanNames, banTypeColorMap]) => {
            if (isMounted) {
                setValidBanNames(filteredRelaxBanNames(validBanNames));
                setBanTypeColorMap(banTypeColorMap);
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        getAllRules(showHiddenRules, isEditable).then(rules => {
            if (isMounted) {
                setRuleData(sortRuleData(rules));
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            setLoading(true);
        };
    }, [showHiddenRules, isEditable, refreshKey]);

    // 生成过滤器选项
    const filterOptions = useMemo<FilterOptions>(() => buildFilterOptions(ruleData ?? []), [ruleData]);

    // 整张表唯一的数据处理链：ruleData -> filter -> sorter -> tableData
    const tableData = useMemo(() => applyTableState(ruleData ?? [], filterState, sortState),
        [ruleData, filterState, sortState],
    );

    // rowSpan 永远只根据"最终可见数据"计算
    const nameRowSpanMap = useMemo(() => computeNameRowSpanMap(tableData), [tableData]);

    const columns = useMemo<EditableColumn[]>(() => {
        if (!banTypeColorMap) return [];

        const getSortOrder = (key: SortKey): SortOrder => sortState.columnKey === key ? sortState.order : null;

        return [
            {
                key: "index",
                title: "编号",
                render: (_value, _record, index) => index + 1,
            },
            {
                key: "name",
                title: "姓名",
                dataIndex: "name",
                filters: filterOptions.names,
                filteredValue: filterState.name ?? null,
                // 不提供 onFilter：实际筛选由 applyTableState 完成
                onCell: record => ({rowSpan: nameRowSpanMap[record.key] ?? 1}),
            },
            {
                key: "banName",
                title: "假期类型",
                dataIndex: "banName",
                filters: filterOptions.banNames,
                filteredValue: filterState.banName ?? null,
                render: value => (
                    <Badge
                        count={value}
                        color={banTypeColorMap[value]}
                        classNames={{indicator: "!rounded-lg !font-bold"}}
                    />
                ),
                editable: isEditable,
            },
            {
                key: "startDate",
                title: "开始日期",
                dataIndex: "startDate",
                filters: filterOptions.startDates,
                filteredValue: filterState.startDate ?? null,
                editable: isEditable,
            },
            {
                key: "endDate",
                title: "结束日期",
                dataIndex: "endDate",
                filters: filterOptions.endDates,
                filteredValue: filterState.endDate ?? null,
                editable: isEditable,
            },
            {
                key: "left_days",
                title: "剩余天数",
                dataIndex: "left_days",
                sorter: true, // sorter: true 只保留 AntD 的排序交互
                sortOrder: getSortOrder("left_days"),
            },
            {
                key: "used_days",
                title: "已休天数",
                dataIndex: "used_days",
                sorter: true,
                sortOrder: getSortOrder("used_days"),
            },
            {
                key: "available_days",
                title: "总天数",
                dataIndex: "available_days",
                sorter: true,
                sortOrder: getSortOrder("available_days"),
                editable: isEditable,
            },
            {
                key: "enabled",
                title: "启用?",
                dataIndex: "enabled",
                filters: filterOptions.enabled,
                filteredValue: filterState.enabled ?? null,
                render: (value, record) => (
                    <Checkbox
                        checked={value}
                        disabled={!isEditable}
                        onChange={event => {
                            const enabled = event.target.checked;
                            setRuleData(prev => {
                                return prev?.map(item => item.key === record.key ? {...item, enabled, hasModified: true} : item) ?? null;
                            });
                        }}
                    />
                ),
            },
            ...(isEditable ? [{
                key: "operations",
                title: "操作",
                render: (_value: unknown, record: IRuleData) => (
                    <Operations value={record} setRuleData={setRuleData}/>
                ),
            }] : []),
        ];
    }, [banTypeColorMap, filterOptions, filterState, setRuleData, isEditable, nameRowSpanMap, sortState]);

    const renderedColumns = useMemo(() => {
        if (columns.length === 0 || !validBanNames) return [];
        const handleSave = (row: IRuleData) => {
            setRuleData(prev => {
                return prev?.map(item => item.key === row.key ? {...item, ...row} : item) ?? null;
            });
        };

        return columns.map((col) => {
            if (!col.editable) return col;
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

    // AntD 只负责把用户选择告诉我们
    // 不读取 extra.currentDataSource，也不在这里维护 rowSpan
    const onChange = useCallback<TableChangeHandler>((_pagination, filters, sorter) => {
        setFilterState(normalizeFilters(filters));
        setSortState(normalizeSorter(sorter));
    }, []);

    const resetTableState = useCallback(() => {
        setFilterState({});
        setSortState(EMPTY_SORT_STATE);
    }, []);

    return {ruleData, tableData, renderedColumns, onChange, resetTableState, loading};
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
        startDate: dayjs(rule.startDate).format("YYYY-MM-DD"),
        endDate: dayjs(rule.endDate).format("YYYY-MM-DD"),
        left_days: rule.left_days,
        used_days: rule.used_days,
        available_days: rule.availableHalfDays / 2,
        enabled: !rule.isHidden,
        hasModified: false,
    })).sort(compareDefaultRuleData);
}

function buildFilterOptions(ruleData: IRuleData[]): FilterOptions {
    const names = new Set<string>();
    const banNames = new Set<string>();
    const startDates = new Set<string>();
    const endDates = new Set<string>();
    const enabled = new Set<boolean>();

    ruleData.forEach(item => {
        names.add(item.name);
        banNames.add(item.banName);
        startDates.add(item.startDate);
        endDates.add(item.endDate);
        enabled.add(item.enabled);
    });

    return {
        names: Array.from(names).sort(compareChineseText).map(text => ({value: text, text})),
        banNames: Array.from(banNames).sort(compareChineseText).map(text => ({value: text, text})),
        startDates: Array.from(startDates).sort().map(text => ({value: text, text})),
        endDates: Array.from(endDates).sort().map(text => ({value: text, text})),
        enabled: Array.from(enabled).sort((a, b) => Number(b) - Number(a))
            .map(value => ({value, text: value ? "已启用" : "未启用"})),
    };
}

function compareChineseText(a: string, b: string): number {
    return a.localeCompare(b, "zh-CN", {sensitivity: "base"});
}

function normalizeFilters(filters: AntdFilters): FilterState {
    return {
        name: filters.name ?? null,
        banName: filters.banName ?? null,
        startDate: filters.startDate ?? null,
        endDate: filters.endDate ?? null,
        enabled: filters.enabled ?? null,
    };
}

function normalizeSorter(sorter: AntdSorter): SortState {
    const activeSorter = Array.isArray(sorter) ? sorter.find(item => Boolean(item.order)) : sorter;
    if (!activeSorter?.order || !isSortKey(activeSorter.columnKey)) return EMPTY_SORT_STATE;

    return {columnKey: activeSorter.columnKey, order: activeSorter.order};
}

function isSortKey(value: unknown): value is SortKey {
    return value === "left_days" || value === "used_days" || value === "available_days";
}

function applyTableState(ruleData: IRuleData[], filters: FilterState, sortState: SortState): IRuleData[] {
    const filteredData = ruleData.filter(record =>
        matchesFilter(record.name, filters.name)
        && matchesFilter(record.banName, filters.banName)
        && matchesFilter(record.startDate, filters.startDate)
        && matchesFilter(record.endDate, filters.endDate)
        && matchesFilter(record.enabled, filters.enabled)
    );

    if (!sortState.columnKey || !sortState.order) return filteredData;

    const direction = sortState.order === "ascend" ? 1 : -1;

    return [...filteredData].sort((a, b) => {
        let compareResult = 0;

        switch (sortState.columnKey) {
            case "left_days":
                compareResult = a.left_days - b.left_days;
                break;
            case "used_days":
                compareResult = a.used_days - b.used_days;
                break;
            case "available_days":
                compareResult = a.available_days - b.available_days;
                break;
        }

        if (compareResult === 0) return compareDefaultRuleData(a, b);

        return compareResult * direction;
    });
}

function matchesFilter(recordValue: string | boolean, filterValues: FilterState[FilterKey]): boolean {
    if (!filterValues?.length) return true;

    return filterValues.some(filterValue => String(filterValue) === String(recordValue));
}

function computeNameRowSpanMap(ruleData: IRuleData[]): Record<number, number> {
    const map: Record<number, number> = {};
    let groupStart = 0;

    while (groupStart < ruleData.length) {
        let groupEnd = groupStart + 1;

        while (groupEnd < ruleData.length && ruleData[groupEnd].name === ruleData[groupStart].name) {
            groupEnd += 1;
        }

        map[ruleData[groupStart].key] = groupEnd - groupStart;

        for (let index = groupStart + 1; index < groupEnd; index += 1) {
            map[ruleData[index].key] = 0;
        }

        groupStart = groupEnd;
    }

    return map;
}
