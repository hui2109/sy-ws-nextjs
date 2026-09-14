import React from "react";
import {useSTSideMenuModalContext} from "@/components/hooks/STSideMenuModalContext";
import {Modal, Table} from "antd";
import {useScheduleTableContext} from "@/components/hooks/ScheduleTableContext";
import {useTransformSTData} from "@/components/tables/ScheduleTable/STSideMenuModals/CheckTableModal/useTransformSTData";
import {useAppContext} from "@/components/hooks/AppProvider";

export default function CheckTableModal() {
    const {resolvedViewport} = useAppContext();
    const {current} = useScheduleTableContext();
    const {setIsModalOpen} = useSTSideMenuModalContext();
    const {dataSource, columns, loading} = useTransformSTData();

    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <Modal
            title={`核查 ${current.format("YYYY年M月")} 的所有排班`}
            closable={true}
            open={true}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="确定"
            footer={(_, {OkBtn}) => <OkBtn/>}
            width={'100%'}
            classNames={{
                body: 'min-h-3',
                container: 'max-desktop:!p-4'
            }}
            style={{top: 20}}
            okButtonProps={{size: resolvedViewport === 'mobile' ? 'small' : 'middle'}}
        >
            <Table
                loading={loading}
                column={{align: 'center'}}
                columns={columns}
                dataSource={dataSource}
                scroll={{x: 'max-content', y: 'calc(100dvh - 190px)'}}
                pagination={false}
                footer={() => ''}
                size={resolvedViewport === 'mobile' ? 'small' : 'middle'}
                bordered
                classNames={{
                    footer: '!p-2',
                    body: {cell: 'max-desktop:!p-1'},
                    header: {cell: 'max-desktop:!p-1'}
                }}
                className='rounded-lg overflow-hidden'
            />
        </Modal>
    );
}