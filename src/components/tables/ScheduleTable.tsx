'use client';

import React, {useContext, useEffect, useState} from 'react';
import {Table} from 'antd';
import {getScheduleTableData, IScheduleCellInfo, IScheduleTableData} from "@/api/utils/getScheduleTableData";
import DateJump from "@/components/dateSelects/DateJump";
import {CurrentDateContext} from "@/components/hooks/CurrentDateContext";
import ToggleButton from "@/components/buttons/ToggleButton";
import {IconFont, IconType} from "@/assets/icons/IconFont";
import ClearTableModal from "@/components/tables/ClearTableModal";
import SubmitTableModal from "@/components/tables/SubmitTableModal";
import AuditTableModal from "@/components/tables/AuditTableModal";
import PaiBanModal from "@/components/tables/PaiBanModal";

export default function ScheduleTable() {
    const [scheduleTableData, setScheduleTableData] = useState<IScheduleTableData>({dataSource: [], columns: []});
    const [loading, setLoading] = useState(true);
    const {current, refreshKey} = useContext(CurrentDateContext);

    const [isPaiBanModalOpen, setIsPaiBanModalOpen] = useState(false);
    const [selectedCell, setSelectedCell] = useState<IScheduleCellInfo | null>(null);
    const handleScheduleTableCellClick = (info: IScheduleCellInfo) => {
        setSelectedCell(info);
        setIsPaiBanModalOpen(true);
    };

    useEffect(() => {
        getScheduleTableData(current, handleScheduleTableCellClick).then(data => {
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
            <ScheduleTableSideMenuModals/>
            <PaiBanModal isModalOpen={isPaiBanModalOpen} cellInfo={selectedCell} onClose={() => setIsPaiBanModalOpen(false)}/>
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

function ScheduleTableSideMenuModals() {
    const {current, refresh} = useContext(CurrentDateContext);

    return (
        <>
            <ClearTableModal current={current} refresh={refresh}/>
            <SubmitTableModal current={current} refresh={refresh}/>
            <AuditTableModal current={current} refresh={refresh}/>
        </>
    )
}

