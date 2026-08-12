import {ILATableCellInfo} from "@/components/tables/LeaveAppointmentTable/useLeaveAppointmentTableData";
import {Badge, Button, Col, Divider, Modal, Popconfirm, Row, Select} from "antd";
import {Weekdays} from "@/configs/general";
import React, {useEffect, useState} from "react";
import {DuplicateCheck} from "@/components/others/DuplicateCheck";
import getValidBanNames from "@/api/BanType/getValidBanNames";
import {getValidStaff} from "@/api/Person/getValidStaff";
import saveLeaveAppointments, {ILeaveAppointmentData} from "@/api/LeaveAppointment/saveLeaveAppointments";
import {useAppContext} from "@/components/hooks/AppProvider";
import deleteLeaveAppointments from "@/api/LeaveAppointment/deleteLeaveAppointments";
import {useCurrentContext} from "@/components/hooks/CurrentContext";
import {filteredRelaxBanNames} from "@/components/utils/filteredRelaxBanNames";

interface ILeaveAppointmentModal {
    isModalOpen: boolean;
    onClose: () => void;
    selectedCell: ILATableCellInfo | null;
}

export default function LeaveAppointmentModal({isModalOpen, onClose, selectedCell}: ILeaveAppointmentModal) {
    const {notification, currentUser} = useAppContext();
    const {current, setCurrent} = useCurrentContext();
    const [duplicateCheck, setDuplicateCheck] = useState(true);
    const [duplicateNum, setDuplicateNum] = useState(5);
    const [validStaffs, setValidStaffs] = useState<Array<string>>([]);
    const [validBanNames, setValidBanNames] = useState<Array<string>>([]);
    const [selectedStaff, setSelectedStaff] = useState<string | null>(currentUser);
    const [selectedBanName, setSelectedBanName] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        Promise.all([
            getValidStaff(),
            getValidBanNames(),
        ]).then(([validStaffs, validBanNames]) => {
            if (isMounted) {
                setValidStaffs(validStaffs);
                setValidBanNames(filteredRelaxBanNames(validBanNames));
            }
        });

        return () => {
            isMounted = false;
        }
    }, []);

    function onOk() {
        if (!selectedCell || !selectedStaff || !selectedBanName || selectedCell?.name) return;

        const leaveAppointments: ILeaveAppointmentData[] = [];
        if (duplicateCheck) {
            for (let i = 0; i < duplicateNum; i++) {
                const appointmentDate = selectedCell.day.add(i, 'day').format('YYYY-MM-DD');
                leaveAppointments.push({
                    sequenceNumber: selectedCell.sequence,
                    appointmentDate,
                    name: selectedStaff,
                    banName: selectedBanName
                })
            }
        } else {
            const appointmentDate = selectedCell.day.format('YYYY-MM-DD');
            leaveAppointments.push({
                sequenceNumber: selectedCell.sequence,
                appointmentDate,
                name: selectedStaff,
                banName: selectedBanName
            })
        }
        const startDate = selectedCell.day.format("YYYY-MM-DD");
        const add_number = duplicateCheck ? duplicateNum - 1 : 0;
        const endDate = selectedCell.day.add(add_number, 'day').format("YYYY-MM-DD");

        saveLeaveAppointments(leaveAppointments).then(r => {
            switch (r) {
                case 'ok':
                    notification.success({
                        title: '预约休假保存成功',
                        description: `${selectedStaff} 的 ${selectedBanName} 预约 (${startDate} 至 ${endDate} 共 ${add_number + 1} 天) 已保存!`
                    })
                    break;
                case 'Unique constraint':
                    notification.error({
                        title: '预约休假保存失败',
                        description: `${selectedStaff} 的 ${selectedBanName} 预约 (${startDate} 至 ${endDate} 共 ${add_number + 1} 天) 保存失败! 因为 ${selectedStaff} 在该时间段内已有相同预约!`
                    })
                    break;
                default:
                    notification.error({
                        title: '预约休假保存失败',
                        description: `系统内部出现错误，请截图联系管理员张旭辉!\n${r}`,
                    })
            }
        });
        setCurrent(current.add(0, 'day'));  // 刷新表格
    }

    function onCancel() {
        if (!selectedCell || !selectedCell?.name) return;

        const startDate = selectedCell.day.format("YYYY-MM-DD");
        const add_number = duplicateCheck ? duplicateNum - 1 : 0;
        const endDate = selectedCell.day.add(add_number, 'day').format("YYYY-MM-DD");

        deleteLeaveAppointments(selectedCell.name, add_number + 1, selectedCell.day.format("YYYY-MM-DD")).then(() => {
            notification.warning({
                title: '预约休假删除成功',
                description: `${selectedCell.name} ${startDate} 至 ${endDate} 共 ${add_number + 1} 天的预约休假 已删除!`
            })
        });
        setCurrent(current.add(0, 'day'));  // 刷新表格
    }

    return (
        <Modal
            loading={!selectedCell}
            title={(
                <>
                    <div className='flex items-center'>
                        <div className={'text-blue-600 font-bold'}>
                            {`预约休假: ${selectedCell?.day.format("M月D日")} (${Weekdays[selectedCell?.day.day() ?? 0]}) 第`}
                        </div>
                        <div className={'text-red-600 font-bold px-1'}>{`${selectedCell?.sequence}`}</div>
                        <div className={'text-blue-600 font-bold'}>顺序位</div>
                    </div>
                    <Divider classNames={{root: '!my-3'}}/>
                </>
            )}
            closable={true}
            open={isModalOpen}
            onOk={() => {
                onOk();
                onClose();
            }}
            onCancel={onClose}
            footer={(_, {OkBtn}) => (
                <div className='flex items-center justify-between'>
                    {(selectedCell?.name && currentUser && selectedCell.name === currentUser) ?
                        <Popconfirm
                            title="确定要取消预约吗?"
                            onConfirm={() => {
                                onCancel();
                                onClose();
                            }}
                            placement='bottom'
                            okButtonProps={{color: 'danger', variant: 'solid'}}
                        >
                            <Button
                                color='danger'
                                variant='solid'
                            >
                                取消预约
                            </Button>
                        </Popconfirm>
                        : <div/>
                    }
                    <OkBtn/>
                </div>
            )}
        >
            <div className="rounded-lg border border-blue-200 shadow-sm">
                <Row align="middle" className="min-h-12 border-b border-blue-200">
                    <Col span={8} className="border-r border-blue-200 text-center font-bold text-blue-900">
                        预约人
                    </Col>
                    <Col span={16} className="text-center font-bold text-slate-700">
                        {selectedCell?.name ??
                            <Select
                                style={{width: 100}}
                                options={validStaffs.map(validBanName => ({
                                    label: validBanName,
                                    value: validBanName,
                                }))}
                                classNames={{popup: {listItem: 'text-center'}}}
                                placeholder='请选择...'
                                value={selectedStaff}
                                onChange={(value) => {
                                    setSelectedStaff(value);
                                }}
                            />
                        }
                    </Col>
                </Row>

                <Row align="middle" className="min-h-12 border-b border-blue-200">
                    <Col span={8} className="border-r border-blue-200 text-center font-bold text-blue-900">
                        假期类型
                    </Col>
                    <Col span={16} className="text-center font-bold text-slate-700">
                        {selectedCell?.banName ?
                            <Badge
                                count={selectedCell.banName}
                                color={selectedCell.color}
                                classNames={{indicator: '!rounded-lg !font-bold'}}
                            /> :
                            <Select
                                style={{width: 100}}
                                options={validBanNames.map(validBanName => ({
                                    label: validBanName,
                                    value: validBanName,
                                }))}
                                classNames={{popup: {listItem: 'text-center'}}}
                                placeholder='请选择...'
                                value={selectedBanName}
                                onChange={(value) => {
                                    setSelectedBanName(value);
                                }}
                            />
                        }
                    </Col>
                </Row>
                <Row align="middle" className="min-h-12">
                    <Col span={24} className="text-center font-bold">
                        <DuplicateCheck
                            text='重复'
                            duplicateCheck={duplicateCheck}
                            duplicateNum={duplicateNum}
                            setDuplicateCheck={setDuplicateCheck}
                            setDuplicateNum={setDuplicateNum}
                        />
                    </Col>
                </Row>
            </div>
        </Modal>
    )
}