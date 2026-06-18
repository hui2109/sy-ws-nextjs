'use client';

import React, {useState} from 'react';
import ScheduleTable from "@/components/tables/ScheduleTable";
import dayjs from "dayjs";
import {CurrentDateContext} from "@/components/hooks/CurrentDateContext";

export default function Start() {
    const [current, setCurrent] = useState<dayjs.Dayjs>(dayjs());

    return (
        <CurrentDateContext value={{current, setCurrent}}>
            <div className='text-center text-2xl text-blue-600 font-bold mb-1'>
                {current.format('YYYY年M月')} 放疗技术组排班表
            </div>
            <ScheduleTable/>
        </CurrentDateContext>
    )
};