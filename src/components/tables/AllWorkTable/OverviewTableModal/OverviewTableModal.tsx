import {Modal, Table} from "antd";
import React from "react";
import {useCurrentContext} from "@/components/hooks/CurrentContext";
import useTransformAWTData from "@/components/tables/AllWorkTable/OverviewTableModal/useTransformAWTData";
import {useAppContext} from "@/components/hooks/AppProvider";

interface IOverviewTableModal {
    isModalOpen: boolean;
    onClose: () => void;
}

export default function OverviewTableModal({isModalOpen, onClose}: IOverviewTableModal) {
    const {resolvedViewport} = useAppContext();
    const {current} = useCurrentContext();
    const {dataSource, columns, loading} = useTransformAWTData();

    return (
        <Modal
            title={`${current.format("YYYY年M月")} 的班种总览`}
            closable={true}
            open={isModalOpen}
            onOk={onClose}
            onCancel={onClose}
            okText="确定"
            footer={(_, {OkBtn}) => <OkBtn/>}
            width={'100%'}
            classNames={{
                body: 'min-h-3',
                container: 'max-desktop:!p-4'
            }}
            style={{top: 20}}
        >
            <Table
                loading={loading}
                columns={columns}
                dataSource={dataSource}
                scroll={{x: 'max-content', y: 'calc(100dvh - 190px)'}}
                pagination={false}
                column={{align: 'center'}}
                size={resolvedViewport === 'mobile' ? 'small' : 'middle'}
                bordered
                classNames={{
                    body: {cell: 'max-desktop:!p-1'},
                    header: {cell: 'max-desktop:!p-1'}
                }}
            />
        </Modal>
    );
}