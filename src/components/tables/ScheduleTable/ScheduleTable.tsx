'use client';

import React, {useContext, useEffect, useState} from "react";
import {CurrentDateContext} from "@/components/hooks/CurrentDateContext";
import ClearTableModal from "@/components/tables/ScheduleTable/ClearTableModal/ClearTableModal";
import AuditTableModal from "@/components/tables/ScheduleTable/AuditTableModal/AuditTableModal";
import {Table} from "antd";
import PaiBanModal from "@/components/tables/ScheduleTable/PaiBanModal/PaiBanModal";
import DateJump from "@/components/dateSelects/DateJump";
import ToggleButton from "@/components/buttons/ToggleButton";
import {IconFont, IconType} from "@/assets/icons/IconFont";
import SubmitTableModal from "@/components/tables/ScheduleTable/SubmitTableModal/SubmitTableModal";
import {getScheduleTableData, IScheduleCellInfo, IScheduleTableData} from "@/components/tables/ScheduleTable/getScheduleTableData";
import dayjs from "dayjs";

export default function ScheduleTable() {
    const [scheduleTableData, setScheduleTableData] = useState<IScheduleTableData>({dataSource: [], columns: []});
    const [loading, setLoading] = useState(true);
    const {current, refreshKey, refresh} = useContext(CurrentDateContext);

    const [isPaiBanModalOpen, setIsPaiBanModalOpen] = useState(false);
    const [selectedCell, setSelectedCell] = useState<IScheduleCellInfo>({name: '', day: dayjs(), bans: []});
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
            <PaiBanModal
                isModalOpen={isPaiBanModalOpen}
                onClose={() => {
                    setIsPaiBanModalOpen(false);
                    refresh();
                }}
                selectedCell={selectedCell}
                setSelectedCell={setSelectedCell}
            />
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