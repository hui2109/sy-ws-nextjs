'use client';

import React, {useRef, useState} from 'react';
import dayjs from "dayjs";
import {ScheduleTableContext} from "@/components/hooks/ScheduleTableContext";
import ScheduleTable from "@/components/tables/ScheduleTable/ScheduleTable";
import ScheduleTableSideMenuModals from "@/components/tables/ScheduleTable/STSideMenuModals/ScheduleTableSideMenuModals";

export default function Start() {
    const [current, setCurrent] = useState<dayjs.Dayjs>(dayjs());
    const [refreshKey, setRefreshKey] = useState(0);
    const [monthStatus, setMonthStatus] = useState<string | null>(null);
    const refresh = () => setRefreshKey(k => k + 1);
    const scheduleTableRef = useRef(null);

    return (
        <ScheduleTableContext value={{current, setCurrent, monthStatus, setMonthStatus, refreshKey, refresh, scheduleTableRef}}>
            <div className='text-center text-2xl text-blue-600 font-bold mb-1' id='BigCurrentTableTitle'>
                {current.format('YYYY年M月')} 放疗技术组排班表
            </div>
            <ScheduleTable/>
            <ScheduleTableSideMenuModals/>
        </ScheduleTableContext>
    )
};