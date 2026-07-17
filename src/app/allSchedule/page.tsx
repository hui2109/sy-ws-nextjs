'use client';

import AllWorkTable from "@/components/tables/AllWorkTable/AllWorkTable";
import {CurrentContext} from "@/components/hooks/CurrentContext";
import React, {useState} from "react";
import dayjs from "dayjs";

export default function AllSchedule() {
    const [current, setCurrent] = useState<dayjs.Dayjs>(dayjs());

    return (
        <CurrentContext value={{current, setCurrent}}>
            <div className='text-center text-2xl text-blue-600 font-bold mb-1' id="BigCurrentTableTitle">
                {current.format('YYYY年M月')} 放疗技术组排班表
            </div>
            <AllWorkTable/>
        </CurrentContext>
    )
}