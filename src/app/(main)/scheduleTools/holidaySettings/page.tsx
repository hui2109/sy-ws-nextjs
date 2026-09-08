'use client';

import HSTable from "@/components/tables/HolidaySettingTable/HSTable";
import {HSTableContext} from "@/components/hooks/HSTableContext";
import {useState} from "react";

export default function HolidaySettings() {
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const refresh = () => setRefreshKey(k => k + 1);

    return (
        <HSTableContext value={{refresh, refreshKey}}>
            <HSTable/>
        </HSTableContext>
    );
}