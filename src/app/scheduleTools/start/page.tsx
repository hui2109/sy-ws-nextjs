'use client';

import React, {useState} from 'react';
import dayjs from "dayjs";
import {CurrentDateContext} from "@/components/hooks/CurrentDateContext";
import ScheduleTable from "@/components/tables/ScheduleTable/ScheduleTable";
import ScheduleTableSideMenuModals from "@/components/tables/ScheduleTable/STSideMenuModals/ScheduleTableSideMenuModals";

export default function Start() {
    const [current, setCurrent] = useState<dayjs.Dayjs>(dayjs());
    const [refreshKey, setRefreshKey] = useState(0);
    const refresh = () => setRefreshKey(k => k + 1);

    return (
        <CurrentDateContext value={{current, setCurrent, refreshKey, refresh}}>
            <div className='text-center text-2xl text-blue-600 font-bold mb-1'>
                {current.format('YYYY年M月')} 放疗技术组排班表
            </div>
            <ScheduleTable/>
            <ScheduleTableSideMenuModals/>
        </CurrentDateContext>
    )
};