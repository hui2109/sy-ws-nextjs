import {Badge, Card, Empty, Modal} from "antd";
import {IconFont, IconType} from "@/assets/icons/IconFont";
import {CalendarOutlined, ClockCircleOutlined, FileTextOutlined, UserOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import {IWorkTableCellInfo} from "@/components/tables/AllWorkTable/useAllWorkTableData";
import {Weekdays} from "@/configs/general";
import getBanTypeInfos, {IBanTypeInfo} from "@/api/BanType/getBanTypeInfos";

interface IBanTypeInfoModal {
    isModalOpen: boolean;
    onClose: () => void;
    selectedCell: IWorkTableCellInfo | null;
}

export default function BanTypeInfoModal({isModalOpen, onClose, selectedCell}: IBanTypeInfoModal) {
    const [loading, setLoading] = useState<boolean>(true);
    const [banTypeInfos, setBanTypeInfos] = useState<IBanTypeInfo[]>([]);

    useEffect(() => {
        if (!selectedCell) return;
        let isMounted = true;

        getBanTypeInfos(selectedCell.bans).then(r => {
            if (isMounted) {
                setBanTypeInfos(r);
                setLoading(false);
            }
        })

        return () => {
            isMounted = false;
            setLoading(true);
        };
    }, [selectedCell]);

    if (!selectedCell) return;

    return (
        <Modal
            loading={loading}
            title={
                <div className='flex items-center gap-2 border-b border-slate-100 pb-3'>
                    <span className='flex h-7 w-7 items-center justify-center rounded-full bg-blue-50'>
                        <IconFont type={IconType.info} useSvg={false} className='!text-base !text-blue-600'/>
                    </span>
                    <b className='text-base'>班种详细信息</b>
                </div>
            }
            closable={true}
            open={isModalOpen}
            onOk={onClose}
            onCancel={onClose}
            okText={'已阅，关闭'}
            footer={(_, {OkBtn}) => <OkBtn/>}
            width={360}
            centered
        >
            <div className='flex flex-col gap-4 pt-1'>
                <div className='flex flex-col gap-2 rounded-lg bg-slate-50 px-4 py-3'>
                    <div className='flex items-center gap-2 text-sm text-slate-700'>
                        <UserOutlined className='text-slate-400'/>
                        <span>{selectedCell.name}</span>
                    </div>
                    <div className='flex items-center gap-2 text-sm text-slate-700'>
                        <CalendarOutlined className='text-slate-400'/>
                        <span>
                            {selectedCell.day.format('YYYY年M月D日') + '（' + Weekdays[selectedCell.day.day()] + '）'}
                        </span>
                    </div>
                </div>

                {banTypeInfos.length > 0 ? (
                    <div className='flex flex-col gap-3'>
                        {banTypeInfos.map((banTypeInfo, index) => (
                            <BanTypeInfoCard key={index} banTypeInfo={banTypeInfo}/>
                        ))}
                    </div>
                ) : !loading && (
                    <Empty description='暂无班种信息' image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                )}
            </div>
        </Modal>
    );
}

function BanTypeInfoCard({banTypeInfo}: { banTypeInfo: IBanTypeInfo }) {
    return (
        <Card
            size='small'
            className='!rounded-lg !shadow-sm transition-shadow hover:!shadow-md'
            styles={{body: {padding: '12px 14px'}}}
            style={{borderLeft: `3px solid ${banTypeInfo.color}`}}
        >
            <div className='flex flex-col gap-2'>
                <Badge
                    count={banTypeInfo.banName}
                    color={banTypeInfo.color}
                    classNames={{indicator: '!rounded-lg !font-bold'}}
                />

                <div className='flex items-center gap-1.5 text-sm text-slate-600'>
                    <ClockCircleOutlined className='text-slate-400'/>
                    <span>{banTypeInfo.startTime}</span>
                    <span className='text-taupe-800'>→</span>
                    <span>{banTypeInfo.endTime}</span>
                </div>

                <div className='flex items-start gap-1.5 text-sm text-slate-500'>
                    <FileTextOutlined className='mt-0.5 shrink-0 text-slate-400'/>
                    <span className='leading-snug'>{banTypeInfo.description}</span>
                </div>
            </div>
        </Card>
    )
}
