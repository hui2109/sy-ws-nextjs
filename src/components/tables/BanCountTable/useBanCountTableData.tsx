'use client';

import {useEffect, useState} from "react";
import {Badge, TableColumnsType} from "antd";
import {getWSbyNameYear} from "@/api/WorkSchedule/getWSbyNameYear";
import {getBanTypeColorMap} from "@/api/BanType/getBanTypeColorMap";
import NullText from "@/components/others/NullText";

type BanCountTableRow = {
    key: number;
    month: string;
    // 动态班种，例如 3A、3B、3C
    [key: string]: string | number;
};

export default function useBanCountTableData(query_name: string | null, query_year: number) {
    const [loading, setLoading] = useState<boolean>(true);
    const [banTypeColorMap, setBanTypeColorMap] = useState<Record<string, string> | null>(null);
    const [yearMonthBanCount, setYearMonthBanCount] = useState<Record<number, Record<number, Record<string, number>>> | null>(null);

    useEffect(() => {
        let isMounted = true;

        getBanTypeColorMap().then(banTypeColorMap => {
            if (isMounted) {
                setBanTypeColorMap(banTypeColorMap);
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!query_name) return;
        let isMounted = true;

        getWSbyNameYear(query_name, query_year).then(data => {
            if (isMounted) {
                setYearMonthBanCount(data);
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            setLoading(true);
        };
    }, [query_name, query_year]);

    if (!yearMonthBanCount) return {dataSource: [], columns: [], loading};

    const yearData = yearMonthBanCount[query_year] ?? {};
    const banNames = Array.from(new Set(Object.values(yearData).flatMap(monthData => Object.keys(monthData)))).sort();

    const dataSource: BanCountTableRow[] = Array.from({length: 12},
        (_, index) => {
            const month = index + 1;

            const monthData = yearData[month] ?? {};
            const row: BanCountTableRow = {
                key: month,
                month: `${month}月`,
            };

            // 每一个班种都生成一个字段
            for (const banName of banNames) {
                row[banName] = monthData[banName] ?? 0;
            }

            row.total = banNames.reduce((sum, banName) => sum + Number(row[banName]), 0);

            return row;
        }
    );

    const totalRow: BanCountTableRow = {
        key: 13,
        month: "合计",
    };
    for (const banName of banNames) {
        totalRow[banName] = dataSource.reduce((sum, row) => sum + Number(row[banName]), 0);
    }
    totalRow.total = dataSource.reduce((sum, row) => sum + Number(row.total), 0);
    dataSource.push(totalRow);

    const columns: TableColumnsType<BanCountTableRow> = [
        {
            title: "月份",
            dataIndex: "month",
        },
        ...banNames.map(banName => ({
            title: banName,
            dataIndex: banName,
            render: (value: number) => {
                if (value === 0) {
                    return <NullText/>
                }
                return (
                    <Badge
                        count={value}
                        color={banTypeColorMap?.[banName]}
                        classNames={{indicator: '!rounded-lg !font-bold'}}
                    />
                )
            },
        })),
        {
            title: "合计",
            dataIndex: "total",
        },
    ];

    return {dataSource, columns, loading};
}
