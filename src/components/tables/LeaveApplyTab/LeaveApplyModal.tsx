import {leaveApplyTypeMap} from "@/configs/general";
import {Button, Modal, Tag} from "antd";
import React, {useEffect, useState} from "react";
import {IClickedLeaveApplyDetails} from "@/components/tables/LeaveApplyTab/LeaveApplyList";
import LeaveApplyFormLoad from "@/components/tables/LeaveApplyTab/LeaveApplyFormLoad";
import {LeaveApplyTabStatus} from "@/components/tables/LeaveApplyTab/LeaveApplyTab";
import {CheckCircleOutlined, CloseCircleOutlined} from "@ant-design/icons";
import {useAppContext} from "@/components/hooks/AppProvider";
import {getPersonRole} from "@/api/Person/getPersonRole";
import {Role} from "@/prisma/generated/enums";
import TextArea from "antd/es/input/TextArea";
import updateLeaveApply from "@/api/LeaveApply/updateLeaveApply";

interface ILeaveApplyModal {
    isModalOpen: boolean;
    onClose: () => void;
    clickedLeaveApplyDetails: IClickedLeaveApplyDetails;
    leaveApplyTabStatus: LeaveApplyTabStatus;
}

export default function LeaveApplyModal({isModalOpen, onClose, clickedLeaveApplyDetails, leaveApplyTabStatus}: ILeaveApplyModal) {
    const {currentUser, notification} = useAppContext();
    const {id, leaveApplyType, applyUser, targetStaff, status} = clickedLeaveApplyDetails;
    const [role, setRole] = useState<Role | null>(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
    const [rejectReason, setRejectReason] = useState<string>('');
    const [modal, contextHolder] = Modal.useModal();

    useEffect(() => {
        if (!currentUser) return;
        let isMounted = true;

        if (isMounted) {
            getPersonRole(currentUser).then(role => setRole(role))
        }

        return () => {
            isMounted = false;
        };
    }, [currentUser]);

    if (!currentUser || !role) return null;

    const canReview = leaveApplyTabStatus !== 'Sent' && status === 'PENDING_REVIEW' && (role !== 'USER' || leaveApplyType === 'SHIFT_SCHEDULE');

    function handleReject() {
        updateLeaveApply(id, 'REJECTED', rejectReason.trim()).then(() => {
            notification.warning({
                title: `${leaveApplyType === 'CHANGE_SCHEDULE' ? targetStaff : applyUser} 的 ${leaveApplyTypeMap[leaveApplyType]} 申请已退回`,
                description: `【退回理由】${rejectReason}`
            });
            setIsRejectModalOpen(false);
            onClose();
        });
    }

    function handleApprove() {
        modal.confirm({
            title: `确定通过 ${leaveApplyType === 'CHANGE_SCHEDULE' ? targetStaff : applyUser} 的 ${leaveApplyTypeMap[leaveApplyType]} 申请?`,
            content: (
                <div className='flex items-center px-1 pb-3.5 pt-2'>
                    <Tag
                        color='success'
                        variant="solid"
                        className="!rounded-full !px-2.5 !py-0.5 !text-xs !font-semibold"
                    >
                        不可撤销
                    </Tag>
                </div>
            ),
            okText: "确定通过",
            cancelText: "点错了",
            okButtonProps: {color: 'green', variant: 'solid'},
            onOk: () => {
                updateLeaveApply(id, 'APPROVED').then(() => {
                    notification.success({
                        title: `${leaveApplyType === 'CHANGE_SCHEDULE' ? targetStaff : applyUser} 的 ${leaveApplyTypeMap[leaveApplyType]} 申请已通过`,
                        description: `${leaveApplyType === 'CHANGE_SCHEDULE' ? targetStaff : applyUser} 的 ${leaveApplyTypeMap[leaveApplyType]} 申请已通过!`
                    });
                    onClose();
                });
            },
        });
    }

    return (
        <>
            <Modal
                title={(
                    <div>
                        {leaveApplyType === 'CHANGE_SCHEDULE' ? targetStaff : applyUser} 的 {leaveApplyTypeMap[leaveApplyType]} 申请记录
                    </div>
                )}
                closable={true}
                open={isModalOpen}
                onOk={onClose}
                onCancel={onClose}
                footer={(_, {OkBtn}) => {
                    if (!canReview) {
                        return <OkBtn/>;
                    }

                    return (
                        <div className="flex justify-end gap-3">
                            <Button
                                danger
                                icon={<CloseCircleOutlined/>}
                                className="min-w-24"
                                onClick={() => setIsRejectModalOpen(true)}
                            >
                                退回
                            </Button>
                            <Button
                                color='green'
                                variant='solid'
                                icon={<CheckCircleOutlined/>}
                                className="min-w-24"
                                onClick={handleApprove}
                            >
                                通过
                            </Button>
                        </div>
                    );
                }}
                width={'80%'}
                centered
            >
                <LeaveApplyFormLoad clickedLeaveApplyDetails={clickedLeaveApplyDetails}/>
            </Modal>
            <Modal
                open={isRejectModalOpen}
                onOk={handleReject}
                onCancel={() => setIsRejectModalOpen(false)}
                title={`确定退回 ${leaveApplyType === 'CHANGE_SCHEDULE' ? targetStaff : applyUser} 的 ${leaveApplyTypeMap[leaveApplyType]} 申请?`}
                okText="确定退回"
                cancelText="点错了"
                okButtonProps={{danger: true}}
                footer={(_, {OkBtn, CancelBtn}) => {
                    return (
                        <div className='flex justify-end items-center gap-2'>
                            {rejectReason.trim() ? <OkBtn/> : null}
                            <CancelBtn/>
                        </div>
                    );
                }}
            >
                <div className={`flex flex-col justify-center gap-3 px-1 pb-3.5 pt-2`}>
                    <div className='flex items-center gap-2'>
                        <Tag
                            color='volcano'
                            variant="solid"
                            className="!rounded-full !px-2.5 !py-0.5 !text-xs !font-semibold"
                        >
                            不可撤销
                        </Tag>
                        <Tag
                            color='volcano'
                            variant="solid"
                            className="!rounded-full !px-2.5 !py-0.5 !text-xs !font-semibold"
                        >
                            退回理由必填
                        </Tag>
                    </div>
                    <TextArea
                        rows={5}
                        placeholder="请简要填写退回理由（必填！）..."
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        maxLength={800}
                        showCount
                    />
                </div>
            </Modal>
            {contextHolder}
        </>
    )
}
