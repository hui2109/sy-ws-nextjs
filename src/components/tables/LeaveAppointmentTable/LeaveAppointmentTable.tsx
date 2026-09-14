import {Table} from "antd";
import React, {useCallback, useState} from "react";
import useLeaveAppointmentTableData, {ILATableCellInfo} from "@/components/tables/LeaveAppointmentTable/useLeaveAppointmentTableData";
import DateJump from "@/components/others/DateJump";
import {useCurrentContext} from "@/components/hooks/CurrentContext";
import LeaveAppointmentModal from "@/components/tables/LeaveAppointmentTable/LeaveAppointmentModal";
import {useAppContext} from "@/components/hooks/AppProvider";

export default function LeaveAppointmentTable() {
    const {resolvedViewport} = useAppContext();
    const [isLAModalOpen, setIsLAModalOpen] = useState(false);
    const [selectedCell, setSelectedCell] = useState<ILATableCellInfo | null>(null);
    const handleLeaveAppointmentTableCellClick = useCallback((info: ILATableCellInfo) => {
        setSelectedCell(info);
        setIsLAModalOpen(true);
    }, []);
    const {dataSource, columns, loading} = useLeaveAppointmentTableData(handleLeaveAppointmentTableCellClick);

    return (
        <div className='max-desktop:px-3 max-desktop:pb-3'>
            <Table
                loading={loading}
                columns={columns}
                dataSource={dataSource}
                scroll={{x: 'max-content', y: 'calc(100dvh - 260px)'}}
                pagination={false}
                title={() => <LeaveAppointmentTableTools/>}
                footer={() => ''}
                column={{align: 'center'}}
                size={resolvedViewport === 'mobile' ? "small" : 'large'}
                bordered
                classNames={{
                    footer: '!p-2 max-desktop:!p-2',
                    title: '!p-3 max-desktop:!p-2',
                    header: {cell: 'max-desktop:!p-1'}
                }}
                className='rounded-lg overflow-hidden'
            />
            <LeaveAppointmentModal
                isModalOpen={isLAModalOpen}
                onClose={() => {
                    setIsLAModalOpen(false);
                }}
                selectedCell={selectedCell}
            />
        </div>
    )
}

function LeaveAppointmentTableTools() {
    const {current, setCurrent} = useCurrentContext();

    return (
        <div className='flex justify-center items-center'>
            <DateJump picker={"month"} current={current} setCurrent={setCurrent}/>
        </div>
    )
}