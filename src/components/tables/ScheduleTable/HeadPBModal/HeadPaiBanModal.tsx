import {useAppContext} from "@/components/hooks/AppProvider";
import {Divider, Modal} from "antd";
import {Weekdays} from "@/configs/general";
import React from "react";
import AddTableForHead from "@/components/tables/ScheduleTable/HeadPBModal/AddTableForHead/AddTableForHead";
import {IPaiBanModalProps} from "@/components/tables/ScheduleTable/PaiBanModal/PaiBanModal";
import {useSelectedHeadContext} from "@/components/hooks/SelectedHeadContext";

export default function HeadPaiBanModal({isModalOpen, onClose}: IPaiBanModalProps) {
    const {resolvedViewport, resolvedTheme} = useAppContext();
    const {selectedHead} = useSelectedHeadContext();

    return (
        <Modal
            title={(
                <>
                    <div className={`font-bold ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                        {`排班: ${selectedHead.day.format("M月D日")} (${Weekdays[selectedHead.day.day()]}) (全天排班)`}
                    </div>
                    <Divider classNames={{root: '!my-3'}}/>
                </>
            )}
            style={{top: 20}}
            closable={true}
            open={isModalOpen}
            onOk={onClose}
            onCancel={onClose}
            okText="确定"
            footer={(_, {OkBtn}) => <OkBtn/>}
            classNames={{
                body: 'min-h-3',
                container: 'max-desktop:!p-4'
            }}
            okButtonProps={{size: resolvedViewport === 'mobile' ? 'small' : 'middle'}}
        >
            <div className={'flex flex-col gap-4'}>
                <AddTableForHead/>
            </div>
        </Modal>
    );
}