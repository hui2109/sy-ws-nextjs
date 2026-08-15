import {Table} from "antd";
import React, {useCallback, useState} from "react";
import useLeaveAppointmentTableData, {ILATableCellInfo} from "@/components/tables/LeaveAppointmentTable/useLeaveAppointmentTableData";
import DateJump from "@/components/others/DateJump";
import {useCurrentContext} from "@/components/hooks/CurrentContext";
import LeaveAppointmentModal from "@/components/tables/LeaveAppointmentTable/LeaveAppointmentModal";

export default function LeaveAppointmentTable() {
    const [isLAModalOpen, setIsLAModalOpen] = useState(false);
    const [selectedCell, setSelectedCell] = useState<ILATableCellInfo | null>(null);
    const handleLeaveAppointmentTableCellClick = useCallback((info: ILATableCellInfo) => {
        setSelectedCell(info);
        setIsLAModalOpen(true);
    }, []);
    const {dataSource, columns, loading} = useLeaveAppointmentTableData(handleLeaveAppointmentTableCellClick);

    return (
        <div>
            <Table
                loading={loading}
                columns={columns}
                dataSource={dataSource}
                scroll={{x: 'max-content', y: 500}}
                pagination={false}
                title={() => <LeaveAppointmentTableTools/>}
                footer={() => ''}
                column={{align: 'center'}}
                size={'large'}
                bordered
                classNames={{
                    footer: '!p-2',
                    title: '!p-3',
                    body: {cell: '!p-3'}
                }}
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
        <div className='flex justify-center'>
            <DateJump picker={"month"} current={current} setCurrent={setCurrent}/>
        </div>
    )
}