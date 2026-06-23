import {Modal} from "antd";
import {IScheduleCellInfo} from "@/api/utils/getScheduleTableData";

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
            title="Basic Modal"
            closable={{'aria-label': 'Custom Close Button'}}
            open={isModalOpen}
            onOk={onClose}
            onCancel={onClose}
        >
            <p>Some contents...</p>
            <p>Some contents...</p>
            <p>Some contents...</p>
        </Modal>
    );
}