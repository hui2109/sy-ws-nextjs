import {leaveApplyTypeMap} from "@/configs/general";
import {Modal} from "antd";
import React from "react";
import {IClickedLeaveApplyDetails} from "@/components/tables/LeaveApplyTab/LeaveApplyList";
import LeaveApplyFormLoad from "@/components/tables/LeaveApplyTab/LeaveApplyFormLoad";

interface ILeaveApplyModal {
    isModalOpen: boolean;
    onClose: () => void;
    clickedLeaveApplyDetails: IClickedLeaveApplyDetails;
}

export default function LeaveApplyModal({isModalOpen, onClose, clickedLeaveApplyDetails}: ILeaveApplyModal) {
    const {leaveApplyType, currentUser, targetStaff} = clickedLeaveApplyDetails;
    return (
        <Modal
            title={(
                <div>
                    {leaveApplyType === 'CHANGE_SCHEDULE' ? targetStaff : currentUser} 的 {leaveApplyTypeMap[leaveApplyType]} 申请记录
                </div>
            )}
            closable={true}
            open={isModalOpen}
            onOk={onClose}
            onCancel={onClose}
            footer={(_, {OkBtn}) => <OkBtn/>}
            width={'80%'}
            centered
        >
            <LeaveApplyFormLoad clickedLeaveApplyDetails={clickedLeaveApplyDetails}/>
        </Modal>
    )
}