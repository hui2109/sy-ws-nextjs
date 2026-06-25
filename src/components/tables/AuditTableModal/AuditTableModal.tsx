import {Dayjs} from "dayjs";
import {useMenuContext} from "@/components/hooks/MenuContext";
import {usePathname} from "next/navigation";
import {auditWSbyMonth} from "@/api/WorkSchedule/auditWSbyMonth";
import {Modal} from "antd";

export default function AuditTableModal({current, refresh}: { current: Dayjs, refresh: () => void }) {
    const {activeSideId, setActiveSideId, notification} = useMenuContext();
    const isModalOpen = activeSideId === 'shenhepaiban';
    const pathName = usePathname();
    const closeModal = () => setActiveSideId(pathName.split('/').at(-1) as string);

    const handleOk = async () => {
        await auditWSbyMonth(current.format('YYYY-MM-DD'));
        notification.success({title: '本月排班已审核', description: `${current.format("YYYY年M月")} 的所有排班已审核!`})
        closeModal();
        refresh();
    };

    const handleCancel = () => {
        closeModal();
    };

    return (
        <>
            <Modal
                title={`确定要审核 ${current.format("YYYY年M月")} 的所有排班吗?`}
                closable={true}
                open={isModalOpen}
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