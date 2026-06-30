import React, {Dispatch, SetStateAction, useCallback, useContext, useState} from "react";
import {CurrentDateContext} from "@/components/hooks/CurrentDateContext";
import ClearTableModal from "@/components/tables/ScheduleTable/ClearTableModal/ClearTableModal";
import AuditTableModal from "@/components/tables/ScheduleTable/AuditTableModal/AuditTableModal";
import {Button, Table} from "antd";
import PaiBanModal from "@/components/tables/ScheduleTable/PaiBanModal/PaiBanModal";
import DateJump from "@/components/dateSelects/DateJump";
import {IconFont, IconType} from "@/assets/icons/IconFont";
import SubmitTableModal from "@/components/tables/ScheduleTable/SubmitTableModal/SubmitTableModal";
import useScheduleTableData, {IScheduleCellInfo, IScheduleTableTools} from "@/components/tables/ScheduleTable/useScheduleTableData";
import dayjs from "dayjs";
import {SelectedCellContext} from "@/components/hooks/SelectedCellContext";

export default function ScheduleTable() {
    const {current, refreshKey, refresh} = useContext(CurrentDateContext);
    const [isPaiBanModalOpen, setIsPaiBanModalOpen] = useState(false);
    const [selectedCell, setSelectedCell] = useState<IScheduleCellInfo>({name: '', day: dayjs(), bans: []});
    const [stToolStatus, setStToolStatus] = useState<IScheduleTableTools>({autoSchedule: false, showPrevMonth: false, eraser: false});

    const handleScheduleTableCellClick = useCallback((info: IScheduleCellInfo) => {
        setSelectedCell(info);
        setIsPaiBanModalOpen(true);
    }, []);

    const {dataSource, columns, loading} = useScheduleTableData(current, refreshKey, stToolStatus, handleScheduleTableCellClick);

    return (
        <>
            <Table
                loading={loading}
                columns={columns}
                dataSource={dataSource}
                scroll={{x: 'max-content', y: 600}}
                pagination={false}
                title={() =>
                    <ScheduleTableTools
                        stToolStatus={stToolStatus}
                        setStToolStatus={setStToolStatus}
                    />}
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
            <SelectedCellContext value={{selectedCell, setSelectedCell}}>
                <PaiBanModal
                    isModalOpen={isPaiBanModalOpen}
                    onClose={() => {
                        setIsPaiBanModalOpen(false);
                        refresh();
                    }}
                />
            </SelectedCellContext>
        </>
    );
}

function ScheduleTableTools({stToolStatus, setStToolStatus}: { stToolStatus: IScheduleTableTools, setStToolStatus: Dispatch<SetStateAction<IScheduleTableTools>> }) {
    const {current, setCurrent} = useContext(CurrentDateContext);

    return (
        <div className='flex justify-center items-center gap-2'>
            <DateJump picker={"month"} current={current} setCurrent={setCurrent}/>
            <Button
                color={stToolStatus.autoSchedule ? 'green' : 'default'}
                variant={stToolStatus.autoSchedule ? 'solid' : 'outlined'}
                onClick={() => setStToolStatus(prev => ({
                    ...prev,
                    autoSchedule: !prev.autoSchedule
                }))}
            >
                自动排班
            </Button>
            <Button
                color={stToolStatus.showPrevMonth ? 'volcano' : 'default'}
                variant={stToolStatus.showPrevMonth ? 'solid' : 'outlined'}
                onClick={() => setStToolStatus(prev => ({
                    ...prev,
                    showPrevMonth: !prev.showPrevMonth
                }))}
            >
                显示上周期
            </Button>
            <Button
                color={stToolStatus.eraser ? 'magenta' : 'default'}
                variant={stToolStatus.eraser ? 'solid' : 'outlined'}
                icon={<IconFont type={IconType.xiangpica}/>}
                onClick={() => setStToolStatus(prev => ({
                    ...prev,
                    eraser: !prev.eraser
                }))}
            />
        </div>
    );
}

function ScheduleTableSideMenuModals() {
    const {current, refresh} = useContext(CurrentDateContext);

    return (
        <>
            <ClearTableModal current={current} refresh={refresh}/>
            <SubmitTableModal current={current} refresh={refresh}/>
            <AuditTableModal current={current} refresh={refresh}/>
        </>
    );
}
