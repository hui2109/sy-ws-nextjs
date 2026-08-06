'use client';

import LeaveAppointmentTable from "@/components/tables/LeaveAppointmentTable/LeaveAppointmentTable";
import React, {useState} from "react";
import dayjs from "dayjs";
import {CurrentContext} from "@/components/hooks/CurrentContext";

export default function LeaveSchedule() {
    const [current, setCurrent] = useState<dayjs.Dayjs>(dayjs());

    return (
        <CurrentContext value={{current, setCurrent}}>
            <div className='text-center text-2xl text-blue-600 font-bold mb-1'>
                {current.format('YYYY年M月')} 放疗技术组预约休假表
            </div>
            <LeaveAppointmentTable/>
        </CurrentContext>
    )
}