'use client';

import React, {useContext, useEffect, useState} from 'react';
import {Table} from 'antd';
import {getScheduleTableData, IScheduleTableData} from "@/api/utils/getScheduleTableData";
import DateJump from "@/components/dateSelects/DateJump";
import {CurrentDateContext} from "@/components/hooks/CurrentDateContext";
import ToggleButton from "@/components/buttons/ToggleButton";
import {IconFont, IconType} from "@/assets/icons/IconFont";
import ClearTableModal from "@/components/tables/ClearTableModal";
import SubmitTableModal from "@/components/tables/SubmitTableModal";
import AuditTableModal from "@/components/tables/AuditTableModal";

export default function ScheduleTable() {
    const [scheduleTableData, setScheduleTableData] = useState<IScheduleTableData>({dataSource: [], columns: []});
    const [loading, setLoading] = useState(true);
    const {current, refreshKey} = useContext(CurrentDateContext);

    useEffect(() => {
        getScheduleTableData(current).then(data => {
            setScheduleTableData(data);
            setLoading(false);
        });
        return () => setLoading(true);
    }, [current, refreshKey]);

    return (
        <>
            <Table
                loading={loading}
                columns={scheduleTableData.columns}
                dataSource={scheduleTableData.dataSource}
                scroll={{x: 'max-content', y: 600}}
                pagination={false}
                title={() => ScheduleTableTools()}
                footer={() => ''}
                column={{align: 'center'}}
                size={'large'}
                bordered
                classNames={{
                    footer: '!p-2',
                    title: '!p-3',
                }}
            />
            <ScheduleTableSideMenuModal/>
        </>
    );
}

function ScheduleTableTools() {
    const {current, setCurrent} = useContext(CurrentDateContext);

    return (
        <div className='flex justify-center items-center gap-2'>
            <DateJump picker={"month"} current={current} setCurrent={setCurrent}/>
            <ToggleButton clickedButtonColor='green'>自动排班</ToggleButton>
            <ToggleButton clickedButtonColor='volcano'>显示上周期</ToggleButton>
            <ToggleButton clickedButtonColor='magenta' icon={<IconFont type={IconType.xiangpica}/>}/>
        </div>
    )
}

function ScheduleTableSideMenuModal() {
    const {current, refresh} = useContext(CurrentDateContext);

    return (
        <>
            <ClearTableModal current={current} refresh={refresh}/>
            <SubmitTableModal current={current} refresh={refresh}/>
            <AuditTableModal current={current} refresh={refresh}/>
        </>
    )
}

