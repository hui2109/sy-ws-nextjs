import {Divider, Modal} from "antd";
import {IScheduleCellInfo} from "@/api/utils/getScheduleTableData";
import {Weekdays} from "@/configs/general";
import ExpectTable from "@/components/tables/ExpectTable";
import VacationTable from "@/components/tables/VacationTable";
import AddTable from "@/components/tables/AddTable";

interface IPaiBanModalProps {
    isModalOpen: boolean;
    selectedCell: IScheduleCellInfo | null;
    onClose: () => void;
}

export default function PaiBanModal({isModalOpen, selectedCell, onClose}: IPaiBanModalProps) {
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
        >
            <div className={'flex flex-col gap-4'}>
                <ExpectTable selectedCell={selectedCell}/>
                <VacationTable selectedCell={selectedCell}/>
                <AddTable selectedCell={selectedCell}/>
            </div>
        </Modal>
    );
}