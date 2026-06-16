import React from 'react';
import ScheduleTable from "@/components/tables/ScheduleTable";
import DateJump from "@/components/dateSelects/DateJump";


export default function Start() {
    return (
        <>
            <DateJump picker={"month"}></DateJump>
            <ScheduleTable></ScheduleTable>
        </>
    )
};