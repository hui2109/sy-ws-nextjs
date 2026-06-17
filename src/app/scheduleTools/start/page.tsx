'use client';

import React, {useState} from 'react';
import ScheduleTable from "@/components/tables/ScheduleTable";
import DateJump from "@/components/dateSelects/DateJump";
import dayjs from "dayjs";


export default function Start() {
    const [current, setCurrent] = useState<dayjs.Dayjs>(dayjs());

    return (
        <>
            <DateJump picker={"month"} current={current} setCurrent={setCurrent}/>
            <ScheduleTable current={current}/>
        </>
    )
};