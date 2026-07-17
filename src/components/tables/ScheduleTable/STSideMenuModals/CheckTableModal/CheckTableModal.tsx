import React from "react";
import {useSTSideMenuModalContext} from "@/components/hooks/STSideMenuModalContext";
import {Modal, Table} from "antd";
import {useScheduleTableContext} from "@/components/hooks/ScheduleTableContext";
import {useTransformSTData} from "@/components/tables/ScheduleTable/STSideMenuModals/CheckTableModal/useTransformSTData";

export default function CheckTableModal() {
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