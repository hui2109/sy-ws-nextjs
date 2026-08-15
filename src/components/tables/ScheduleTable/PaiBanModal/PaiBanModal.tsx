import {Divider, Modal} from "antd";
import {Weekdays} from "@/configs/general";
import ExpectTable from "@/components/tables/ScheduleTable/PaiBanModal/ExpectTable/ExpectTable";
import AddTable from "@/components/tables/ScheduleTable/PaiBanModal/AddTable/AddTable";
import VacationTable from "@/components/tables/ScheduleTable/PaiBanModal/VacationTable/VacationTable";
import React from "react";
import {useSelectedCellContext} from "@/components/hooks/SelectedCellContext";
import {useAppContext} from "@/components/hooks/AppProvider";

export interface IPaiBanModalProps {
    isModalOpen: boolean;
    onClose: () => void;
}

export default function PaiBanModal({isModalOpen, onClose}: IPaiBanModalProps) {
    const {selectedCell} = useSelectedCellContext();
    const {resolvedTheme} = useAppContext();

    return (
        <Modal
            title={(
                <>
                    <div className={`font-bold ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
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
                <ExpectTable/>
                <VacationTable/>
                <AddTable/>
            </div>
        </Modal>
    );
}