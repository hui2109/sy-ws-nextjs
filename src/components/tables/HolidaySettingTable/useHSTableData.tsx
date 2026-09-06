'use client';

import {useCallback, useEffect, useMemo, useState} from "react";
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
    color: string;
    hasModified: boolean;
}

type EditableColumn = ColumnType<IRuleData> & {
    editable?: boolean;
};

type TableChangeHandler = NonNullable<TableProps<IRuleData>["onChange"]>;
type AntdFilters = Parameters<TableChangeHandler>[1];
type AntdSorter = Parameters<TableChangeHandler>[2];

type FilterKey =
    | "name"
    | "banName"
    | "startDate"
    | "endDate"
    | "enabled";

type FilterState = Partial<Record<FilterKey, AntdFilters[string]>>;

type SortKey =
    | "left_days"
    | "used_days"
    | "available_days";

type SortOrder = "ascend" | "descend" | null;

interface SortState {
    columnKey: SortKey | null;
    order: SortOrder;
}

interface RulesSnapshot {
    showHiddenRules: boolean;
    data: IRuleData[];
}

interface TableMeta {
    validBanNames: string[];
    banTypeColorMap: Record<string, string>;
}

interface FilterOptions {
    names: Array<{ value: string; text: string }>;
    banNames: Array<{ value: string; text: string }>;
    startDates: Array<{ value: string; text: string }>;
    endDates: Array<{ value: string; text: string }>;
    enabled: Array<{ value: boolean; text: string }>;
}

const EMPTY_SORT_STATE: SortState = {
    columnKey: null,
    order: null,
};

export default function useHSTableData(
    showHiddenRules: boolean,
    isEditable: boolean,
) {
    const {currentUser} = useAppContext();

    // 这里只保存“外部系统返回的事实”。
    const [rulesSnapshot, setRulesSnapshot] =
        useState<RulesSnapshot | null>(null);

    const [tableMeta, setTableMeta] =
        useState<TableMeta | null>(null);

    // filter / sorter 是用户操作产生的真实 UI 状态。
    const [filterState, setFilterState] =
        useState<FilterState>({});

    const [sortState, setSortState] =
        useState<SortState>(EMPTY_SORT_STATE);

    /*
     * Effect 只负责和 API 同步。
     * 不在这里同步 setLoading / setRowSpan / setFilteredData。
     *
     * cleanup 的 ignore 标记用于阻止旧请求覆盖新状态。
     */
    useEffect(() => {
        if (rulesSnapshot?.showHiddenRules === showHiddenRules) {
            return;
        }

        let ignore = false;

        getAllRules(showHiddenRules).then(rules => {
            if (ignore) {
                return;
            }

            setRulesSnapshot({
                showHiddenRules,
                data: sortRuleData(rules),
            });
        });

        return () => {
            ignore = true;
        };
    }, [showHiddenRules, rulesSnapshot?.showHiddenRules]);

    useEffect(() => {
        let ignore = false;

        Promise.all([
            getValidBanNames(),
            getBanTypeColorMap(),
        ]).then(([validBanNames, banTypeColorMap]) => {
            if (ignore) {
                return;
            }

            setTableMeta({
                validBanNames: filteredRelaxBanNames(validBanNames),
                banTypeColorMap,
            });
        });

        return () => {
            ignore = true;
        };
    }, []);

    /*
     * 请求切换期间保留上一份数据，让 Table 保持挂载；
     * loading 由“snapshot 是否对应当前请求参数”直接推导。
     */
    const ruleData = rulesSnapshot?.data ?? null;

    const rulesLoading =
        rulesSnapshot?.showHiddenRules !== showHiddenRules;

    const metaLoading =
        tableMeta === null;

    const loading =
        rulesLoading || metaLoading;

    /*
     * 只读模式要等 currentUser 可用后再第一次挂载 Table，
     * 这样默认姓名筛选从第一次显示开始就是正确的。
     */
    const ready =
        ruleData !== null
        && tableMeta !== null
        && (isEditable || Boolean(currentUser));

    /*
     * 统一修改当前规则数据。
     * 如果当前 snapshot 属于旧的 showHiddenRules 参数，
     * 则拒绝对旧数据进行编辑。
     */
    const updateRuleData = useCallback(
        (updater: (previous: IRuleData[]) => IRuleData[]) => {
            setRulesSnapshot(previous => {
                if (
                    !previous
                    || previous.showHiddenRules !== showHiddenRules
                ) {
                    return previous;
                }

                const nextData = updater(previous.data);

                if (Object.is(nextData, previous.data)) {
                    return previous;
                }

                return {
                    ...previous,
                    data: nextData,
                };
            });
        },
        [showHiddenRules],
    );

    /*
     * 只读模式下：
     * 用户尚未操作姓名筛选 -> 默认 currentUser；
     * 用户一旦操作过（包括清空） -> 以后都尊重用户选择。
     */
    const effectiveFilters = useMemo<FilterState>(() => {
        const nameFilter =
            filterState.name !== undefined
                ? filterState.name
                : (!isEditable && currentUser
                    ? [currentUser]
                    : null);

        return {
            ...filterState,
            name: nameFilter,
        };
    }, [filterState, isEditable, currentUser]);

    /*
     * 筛选菜单从完整 ruleData 生成，
     * 不从 tableData 生成，避免筛选条件彼此“吃掉”选项。
     */
    const filterOptions = useMemo<FilterOptions>(
        () => buildFilterOptions(ruleData ?? []),
        [ruleData],
    );

    /*
     * 整张表唯一的数据处理链：
     *
     * ruleData
     *   -> filter
     *   -> sorter
     *   -> tableData
     */
    const tableData = useMemo(
        () => applyTableState(
            ruleData ?? [],
            effectiveFilters,
            sortState,
        ),
        [ruleData, effectiveFilters, sortState],
    );

    /*
     * rowSpan 永远只根据“最终可见数据”计算。
     */
    const nameRowSpanMap = useMemo(
        () => computeNameRowSpanMap(tableData),
        [tableData],
    );

    const columns = useMemo<EditableColumn[]>(() => {
        if (!tableMeta) {
            return [];
        }

        const {banTypeColorMap} = tableMeta;

        const getSortOrder = (key: SortKey): SortOrder =>
            sortState.columnKey === key
                ? sortState.order
                : null;

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
                filteredValue: effectiveFilters.name ?? null,

                // 不提供 onFilter：实际筛选由 applyTableState 完成。
                onCell: record => ({
                    rowSpan: nameRowSpanMap[record.key] ?? 1,
                }),
            },
            {
                key: "banName",
                title: "假期类型",
                dataIndex: "banName",
                filters: filterOptions.banNames,
                filteredValue: effectiveFilters.banName ?? null,
                render: value => (
                    <Badge
                        count={value}
                        color={banTypeColorMap[value]}
                        classNames={{
                            indicator: "!rounded-lg !font-bold",
                        }}
                    />
                ),
                editable: isEditable,
            },
            {
                key: "startDate",
                title: "开始日期",
                dataIndex: "startDate",
                filters: filterOptions.startDates,
                filteredValue: effectiveFilters.startDate ?? null,
                editable: isEditable,
            },
            {
                key: "endDate",
                title: "结束日期",
                dataIndex: "endDate",
                filters: filterOptions.endDates,
                filteredValue: effectiveFilters.endDate ?? null,
                editable: isEditable,
            },
            {
                key: "left_days",
                title: "剩余天数",
                dataIndex: "left_days",

                // sorter: true 只保留 AntD 的排序交互。
                sorter: true,
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
                filteredValue: effectiveFilters.enabled ?? null,
                render: (value, record) => (
                    <Checkbox
                        checked={value}
                        disabled={!isEditable || rulesLoading}
                        onChange={event => {
                            const enabled = event.target.checked;

                            updateRuleData(previous =>
                                previous.map(item =>
                                    item.key === record.key
                                        ? {
                                            ...item,
                                            enabled,
                                            hasModified: true,
                                        }
                                        : item
                                )
                            );
                        }}
                    />
                ),
            },
            ...(isEditable
                ? [{
                    key: "operations",
                    title: "操作",
                    render: (
                        _value: unknown,
                        record: IRuleData,
                    ) => (
                        <Operations
                            value={record}
                            updateRuleData={updateRuleData}
                            disabled={rulesLoading}
                        />
                    ),
                }]
                : []),
        ];
    }, [
        effectiveFilters,
        filterOptions,
        isEditable,
        nameRowSpanMap,
        rulesLoading,
        sortState,
        tableMeta,
        updateRuleData,
    ]);

    /*
     * 为可编辑列注入 EditableComponents 所需的 cell props。
     * 同时保留列本身已有的 onCell，避免后续扩展时被覆盖。
     */
    const renderedColumns = useMemo(() => {
        if (
            columns.length === 0
            || !tableMeta
        ) {
            return [];
        }

        const {validBanNames} = tableMeta;

        const handleSave = (row: IRuleData) => {
            updateRuleData(previous =>
                previous.map(item =>
                    item.key === row.key
                        ? {...item, ...row}
                        : item
                )
            );
        };

        return columns.map(column => {
            if (!column.editable) {
                return column;
            }

            const originalOnCell = column.onCell;

            return {
                ...column,
                onCell: (record: IRuleData, rowIndex: number) => ({
                    ...(originalOnCell?.(record, rowIndex) ?? {}),
                    title: column.title,
                    editable: column.editable,
                    dataIndex: column.dataIndex as keyof IRuleData,
                    record,
                    validBanNames,
                    handleSave,
                }),
            };
        });
    }, [
        columns,
        tableMeta,
        updateRuleData,
    ]);

    /*
     * AntD 只负责把用户选择告诉我们。
     * 不读取 extra.currentDataSource，也不在这里维护 rowSpan。
     */
    const onChange = useCallback<TableChangeHandler>(
        (_pagination, filters, sorter) => {
            setFilterState(normalizeFilters(filters));
            setSortState(normalizeSorter(sorter));
        },
        [],
    );

    const resetTableState = useCallback(() => {
        setFilterState({});
        setSortState(EMPTY_SORT_STATE);
    }, []);

    return {
        ruleData,
        tableData,
        renderedColumns,
        loading,
        ready,
        onChange,
        resetTableState,
    };
}

function Operations({
                        value,
                        updateRuleData,
                        disabled,
                    }: {
    value: IRuleData;
    updateRuleData: (
        updater: (previous: IRuleData[]) => IRuleData[]
    ) => void;
    disabled: boolean;
}) {
    const {notification} = useAppContext();

    const handleDelete = (rule: IRuleData) => {
        if (disabled) {
            return;
        }

        deleteRule(rule.key).then(() => {
            updateRuleData(previous =>
                previous.filter(item =>
                    item.key !== rule.key
                )
            );

            notification.warning({
                title: "假期规则已删除",
                description:
                    `${rule.name} 的 ${rule.banName} 规则 `
                    + `(${rule.startDate}至${rule.endDate} `
                    + `${rule.available_days} 天) 已删除!`,
            });
        });
    };

    return (
        <Space size="medium">
            <Popconfirm
                title="确定要删除吗？(不可撤销！)"
                onConfirm={() => handleDelete(value)}
                okButtonProps={{
                    color: "danger",
                    variant: "solid",
                    disabled,
                }}
                disabled={disabled}
            >
                <a
                    aria-disabled={disabled}
                    style={
                        disabled
                            ? {
                                pointerEvents: "none",
                                opacity: 0.45,
                            }
                            : undefined
                    }
                >
                    删除?
                </a>
            </Popconfirm>
        </Space>
    );
}

function sortRuleData(
    rules: Awaited<ReturnType<typeof getAllRules>>,
): IRuleData[] {
    return rules
        .map(rule => ({
            key: rule.id,
            id: rule.id,
            name: rule.person.name,
            banName: rule.banType.banName,
            startDate: dayjs(rule.startDate)
                .format("YYYY-MM-DD"),
            endDate: dayjs(rule.endDate)
                .format("YYYY-MM-DD"),
            left_days: rule.left_days,
            used_days: rule.used_days,
            available_days:
                rule.availableHalfDays / 2,
            enabled: !rule.isHidden,
            color: rule.banType.color,
            hasModified: false,
        }))
        .sort(compareDefaultRuleData);
}

function compareDefaultRuleData(
    a: IRuleData,
    b: IRuleData,
): number {
    const nameCompare = String(a.name).localeCompare(
        String(b.name),
        "zh-CN",
        {sensitivity: "base"},
    );

    if (nameCompare !== 0) {
        return nameCompare;
    }

    const enabledCompare =
        Number(b.enabled) - Number(a.enabled);

    if (enabledCompare !== 0) {
        return enabledCompare;
    }

    return String(a.banName).localeCompare(
        String(b.banName),
        "zh-CN",
        {sensitivity: "base"},
    );
}

function buildFilterOptions(
    ruleData: IRuleData[],
): FilterOptions {
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
        names: Array.from(names)
            .sort(compareChineseText)
            .map(text => ({
                value: text,
                text,
            })),

        banNames: Array.from(banNames)
            .sort(compareChineseText)
            .map(text => ({
                value: text,
                text,
            })),

        startDates: Array.from(startDates)
            .sort()
            .map(text => ({
                value: text,
                text,
            })),

        endDates: Array.from(endDates)
            .sort()
            .map(text => ({
                value: text,
                text,
            })),

        enabled: Array.from(enabled)
            .sort((a, b) =>
                Number(b) - Number(a)
            )
            .map(value => ({
                value,
                text: value
                    ? "已启用"
                    : "未启用",
            })),
    };
}

function compareChineseText(
    a: string,
    b: string,
): number {
    return a.localeCompare(
        b,
        "zh-CN",
        {sensitivity: "base"},
    );
}

function normalizeFilters(
    filters: AntdFilters,
): FilterState {
    return {
        name: filters.name ?? null,
        banName: filters.banName ?? null,
        startDate: filters.startDate ?? null,
        endDate: filters.endDate ?? null,
        enabled: filters.enabled ?? null,
    };
}

function normalizeSorter(
    sorter: AntdSorter,
): SortState {
    const activeSorter = Array.isArray(sorter)
        ? sorter.find(item => Boolean(item.order))
        : sorter;

    if (
        !activeSorter?.order
        || !isSortKey(activeSorter.columnKey)
    ) {
        return EMPTY_SORT_STATE;
    }

    return {
        columnKey: activeSorter.columnKey,
        order: activeSorter.order,
    };
}

function isSortKey(
    value: unknown,
): value is SortKey {
    return value === "left_days"
        || value === "used_days"
        || value === "available_days";
}

function applyTableState(
    ruleData: IRuleData[],
    filters: FilterState,
    sortState: SortState,
): IRuleData[] {
    const filteredData = ruleData.filter(record =>
            matchesFilter(
                record.name,
                filters.name,
            )
            && matchesFilter(
                record.banName,
                filters.banName,
            )
            && matchesFilter(
                record.startDate,
                filters.startDate,
            )
            && matchesFilter(
                record.endDate,
                filters.endDate,
            )
            && matchesFilter(
                record.enabled,
                filters.enabled,
            )
    );

    if (
        !sortState.columnKey
        || !sortState.order
    ) {
        return filteredData;
    }

    const direction =
        sortState.order === "ascend"
            ? 1
            : -1;

    return [...filteredData].sort((a, b) => {
        let compareResult = 0;

        switch (sortState.columnKey) {
            case "left_days":
                compareResult =
                    a.left_days - b.left_days;
                break;

            case "used_days":
                compareResult =
                    a.used_days - b.used_days;
                break;

            case "available_days":
                compareResult =
                    a.available_days
                    - b.available_days;
                break;
        }

        if (compareResult === 0) {
            return compareDefaultRuleData(a, b);
        }

        return compareResult * direction;
    });
}

function matchesFilter(
    recordValue: string | boolean,
    filterValues: FilterState[FilterKey],
): boolean {
    if (!filterValues?.length) {
        return true;
    }

    return filterValues.some(filterValue =>
        String(filterValue)
        === String(recordValue)
    );
}

function computeNameRowSpanMap(
    ruleData: IRuleData[],
): Record<number, number> {
    const map: Record<number, number> = {};

    let groupStart = 0;

    while (groupStart < ruleData.length) {
        let groupEnd = groupStart + 1;

        while (
            groupEnd < ruleData.length
            && ruleData[groupEnd].name
            === ruleData[groupStart].name
            ) {
            groupEnd += 1;
        }

        map[ruleData[groupStart].key] =
            groupEnd - groupStart;

        for (
            let index = groupStart + 1;
            index < groupEnd;
            index += 1
        ) {
            map[ruleData[index].key] = 0;
        }

        groupStart = groupEnd;
    }

    return map;
}
