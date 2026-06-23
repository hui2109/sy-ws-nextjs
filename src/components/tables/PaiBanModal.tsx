import {Divider, Modal} from "antd";
import {IScheduleCellInfo} from "@/api/utils/getScheduleTableData";
import {Weekdays} from "@/configs/general";
import ExpectTable from "@/components/tables/ExpectTable";
import VacationTable from "@/components/tables/VacationTable";
import AddTable from "@/components/tables/AddTable";

interface IPaiBanModalProps {
    isModalOpen: boolean;
    cellInfo: IScheduleCellInfo | null;
    onClose: () => void;
}

export default function PaiBanModal({isModalOpen, cellInfo, onClose}: IPaiBanModalProps) {
    if (!cellInfo) {
        return null;
    }

    return (
        <Modal
            title={(
                <>
                    <div className={'text-blue-600 font-bold'}>
                        {`排班: ${cellInfo.name} ${cellInfo.day.format("M月D日")} (${Weekdays[cellInfo.day.day()]})`}
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
                <ExpectTable></ExpectTable>
                <VacationTable></VacationTable>
                <AddTable></AddTable>
            </div>
        </Modal>
    );
}