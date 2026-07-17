import {Modal, Table} from "antd";
import React from "react";
import {useCurrentContext} from "@/components/hooks/CurrentContext";
import useTransformAWTData from "@/components/tables/AllWorkTable/OverviewTableModal/useTransformAWTData";

interface IOverviewTableModal {
    isModalOpen: boolean;
    onClose: () => void;
}

export default function OverviewTableModal({isModalOpen, onClose}: IOverviewTableModal) {
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
            classNames={{body: 'min-h-3'}}
            footer={(_, {OkBtn}) => <OkBtn/>}
            width={'80%'}
        >
            <Table
                loading={loading}
                columns={columns}
                dataSource={dataSource}
                scroll={{x: 'max-content', y: 800}}
                pagination={false}
                column={{align: 'center'}}
                size={'middle'}
                bordered
            />
        </Modal>
    );
}