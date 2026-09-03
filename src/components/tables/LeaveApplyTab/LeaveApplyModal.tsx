import {leaveApplyTypeMap} from "@/configs/general";
import {Button, Modal, Popconfirm, Tag} from "antd";
import React, {useEffect, useState} from "react";
import {IClickedLeaveApplyDetails} from "@/components/tables/LeaveApplyTab/LeaveApplyList";
import LeaveApplyFormLoad from "@/components/tables/LeaveApplyTab/LeaveApplyFormLoad";
import {LeaveApplyTabStatus} from "@/components/tables/LeaveApplyTab/LeaveApplyTab";
import {CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, SendOutlined} from "@ant-design/icons";
import {useAppContext} from "@/components/hooks/AppProvider";
import {getPersonRole} from "@/api/Person/getPersonRole";
import {Role} from "@/prisma/generated/enums";
import TextArea from "antd/es/input/TextArea";
import updateLeaveApply from "@/api/LeaveApply/updateLeaveApply";
import deleteLeaveApply from "@/api/LeaveApply/deleteLeaveApply";
import {useLeaveApplyTabContext} from "@/components/hooks/LeaveApplyTabContext";

interface ILeaveApplyModal {
    isModalOpen: boolean;
    onClose: () => void;
    clickedLeaveApplyDetails: IClickedLeaveApplyDetails;
    leaveApplyTabStatus: LeaveApplyTabStatus;
}

export default function LeaveApplyModal({isModalOpen, onClose, clickedLeaveApplyDetails, leaveApplyTabStatus}: ILeaveApplyModal) {
    const {currentUser, notification} = useAppContext();
    const {refresh} = useLeaveApplyTabContext();
    const {id, leaveApplyType, applyUser, targetStaff, status} = clickedLeaveApplyDetails;
    const [role, setRole] = useState<Role | null>(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
    const [rejectReason, setRejectReason] = useState<string>('');
    const [modal, contextHolder] = Modal.useModal();
    const formApplicant = leaveApplyType !== 'CHANGE_SCHEDULE' ? applyUser : targetStaff;

    useEffect(() => {
        if (!currentUser) return;
        let isMounted = true;

        getPersonRole(currentUser).then(role => {
            if (isMounted) {
                setRole(role)
            }
        })

        return () => {
            isMounted = false;
        };
    }, [currentUser]);

    if (!currentUser || !role) return null;

    const canReview = (leaveApplyTabStatus === 'Received' && status === 'PENDING_REVIEW' && (role !== 'USER' || leaveApplyType === 'SHIFT_SCHEDULE')) ||
        (leaveApplyTabStatus === 'Sent' && status === 'DRAFT');

    function handleReject() {
        updateLeaveApply(id, 'REJECTED', rejectReason.trim()).then(() => {
            notification.warning({
                title: '假勤申请 已退回',
                description: (
                    <div>
                        <div>{formApplicant} 的 {leaveApplyTypeMap[leaveApplyType]} 申请已退回</div>
                        <div>【退回理由】{rejectReason}</div>
                    </div>
                )
            });
            setIsRejectModalOpen(false);
            onClose();
            refresh();
        });
    }

    function handleApprove() {
        modal.confirm({
            title: `确定通过 ${formApplicant} 的 ${leaveApplyTypeMap[leaveApplyType]} 申请?`,
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
                updateLeaveApply(id, 'APPROVED').then((error_message) => {
                    if (error_message === null) {
                        notification.success({
                            title: '假勤申请 已通过',
                            description: `${leaveApplyType === 'CHANGE_SCHEDULE' ? targetStaff : applyUser} 的 ${leaveApplyTypeMap[leaveApplyType]} 申请已通过!`
                        });
                    } else {
                        notification.error({
                            title: '假勤申请 已退至 待审核',
                            description: (
                                <div>
                                    <div>{formApplicant} 的 {leaveApplyTypeMap[leaveApplyType]} 申请已退至 待审核</div>
                                    <div>【理由】{error_message}</div>
                                </div>
                            )
                        });
                    }
                    onClose();
                    refresh();
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

                    if (status === 'DRAFT') {
                        return (
                            <div className="flex justify-end gap-3">
                                <Popconfirm
                                    title="确定要删除吗？(不可撤销！)"
                                    onConfirm={() => {
                                        deleteLeaveApply(id).then(() => {
                                            notification.warning({
                                                title: '假期申请 删除成功',
                                                description: `${formApplicant} 的 ${leaveApplyTypeMap[leaveApplyType]} 申请删除成功!`
                                            });
                                            onClose();
                                            refresh();
                                        })
                                    }}
                                    okButtonProps={{color: 'danger', variant: 'solid'}}
                                >
                                    <Button
                                        color='danger'
                                        variant='solid'
                                        icon={<DeleteOutlined/>}
                                        className="min-w-24"
                                    >
                                        删除申请
                                    </Button>
                                </Popconfirm>
                                <Button
                                    type='primary'
                                    icon={<SendOutlined/>}
                                    className="min-w-24"
                                    onClick={() => {
                                        updateLeaveApply(id, 'PENDING_REVIEW').then(() => {
                                            notification.success({
                                                title: `假期申请 提交成功`,
                                                description: `${formApplicant} 的 ${leaveApplyTypeMap[leaveApplyType]} 申请提交成功! 当前状态: 待审核!`
                                            });
                                            onClose();
                                            refresh();
                                        })
                                    }}
                                >
                                    提交申请
                                </Button>
                            </div>
                        )
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
