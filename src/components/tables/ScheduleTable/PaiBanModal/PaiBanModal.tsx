import {Divider, Modal} from "antd";
import {Weekdays} from "@/configs/general";
import ExpectTable from "@/components/tables/ScheduleTable/PaiBanModal/ExpectTable/ExpectTable";
import AddTable from "@/components/tables/ScheduleTable/PaiBanModal/AddTable/AddTable";
import VacationTable from "@/components/tables/ScheduleTable/PaiBanModal/VacationTable/VacationTable";
import {IScheduleCellInfo} from "@/components/tables/ScheduleTable/getScheduleTableData";
import React, {Dispatch, SetStateAction} from "react";

export interface IPaiBanModalProps {
    isModalOpen: boolean;
    onClose: () => void;
    selectedCell: IScheduleCellInfo;
    setSelectedCell: Dispatch<SetStateAction<IScheduleCellInfo>>;
}

export default function PaiBanModal({isModalOpen, onClose, selectedCell, setSelectedCell}: IPaiBanModalProps) {
    if (!selectedCell) {
        return null;
    }

    return (
        <Modal
            title={(
                <>
                    <div className={'text-blue-600 font-bold'}>
                        {`排班: ${selectedCell.name} ${selectedCell.day.format("M月D日")} (${Weekdays[selectedCell.day.day()]})`}
                    </div>
                    <Divider classNames={{root: '!my-3'}}/>
                </>
            )}
            closable={true}
            open={isModalOpen}
            onOk={onClose}
            onCancel={onClose}
            footer={(_, {OkBtn}) => <OkBtn/>}
        >
            <div className={'flex flex-col gap-4'}>
                <ExpectTable selectedCell={selectedCell}/>
                <VacationTable selectedCell={selectedCell}/>
                <AddTable selectedCell={selectedCell} setSelectedCell={setSelectedCell}/>
            </div>
        </Modal>
    );
}