import {Dayjs} from "dayjs";
import {useMenuContext} from "@/components/hooks/MenuContext";
import {usePathname} from "next/navigation";
import {clearWSbyMonth} from "@/api/WorkSchedule/clearWSbyMonth";
import {Modal} from "antd";

export default function ClearTableModal({current, refresh}: { current: Dayjs, refresh: () => void }) {
    const {activeSideId, setActiveSideId, notification} = useMenuContext();
    const pathName = usePathname();
    const isModalOpen = activeSideId === 'qingkongpaiban';
    const closeModal = () => setActiveSideId(pathName.split('/').at(-1) as string);

    const handleOk = async () => {
        await clearWSbyMonth(current.format('YYYY-MM-DD'));
        notification.success({title: '本月排班已清空', description: `${current.format("YYYY年M月")} 的所有排班已清空!`})
        closeModal();
        refresh();
    };

    const handleCancel = () => {
        closeModal();
    };

    return (
        <>
            <Modal
                title={`确定要清空 ${current.format("YYYY年M月")} 的所有排班吗?`}
                closable={true}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="确定清除"
                cancelText="点错了"
                okButtonProps={{danger: true}}
                classNames={{body: 'min-h-3'}}
            >
            </Modal>
        </>
    );
};