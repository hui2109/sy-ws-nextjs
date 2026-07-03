import {useAppContext} from "@/components/hooks/AppProvider";
import {auditWSbyMonth} from "@/api/WorkSchedule/auditWSbyMonth";
import {Modal} from "antd";
import {useSTSideMenuModalContext} from "@/components/hooks/STSideMenuModalContext";
import {useScheduleTableContext} from "@/components/hooks/ScheduleTableContext";

export default function AuditTableModal() {
    const {notification} = useAppContext();
    const {setIsModalOpen} = useSTSideMenuModalContext();
    const {current, refresh} = useScheduleTableContext();

    const handleOk = async () => {
        await auditWSbyMonth(current.format('YYYY-MM-DD'));
        notification.success({title: '本月排班已审核', description: `${current.format("YYYY年M月")} 的所有排班已审核!`})
        setIsModalOpen(false);
        refresh();
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Modal
                title={`确定要审核 ${current.format("YYYY年M月")} 的所有排班吗?`}
                closable={true}
                open={true}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="确定审核"
                cancelText="点错了"
                okButtonProps={{color: 'green', variant: "solid"}}
                classNames={{body: 'min-h-3'}}
            >
            </Modal>
        </>
    );
}