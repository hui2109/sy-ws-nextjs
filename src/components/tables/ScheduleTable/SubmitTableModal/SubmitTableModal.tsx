import {Dayjs} from "dayjs";
import {useMenuContext} from "@/components/hooks/MenuContext";
import {usePathname} from "next/navigation";
import {submitWSbyMonth} from "@/api/WorkSchedule/submitWSbyMonth";
import {Modal} from "antd";

export default function SubmitTableModal({current, refresh}: { current: Dayjs, refresh: () => void }) {
    const {activeSideId, setActiveSideId, notification} = useMenuContext();
    const isModalOpen = activeSideId === 'tijiaopaiban';
    const pathName = usePathname();
    const closeModal = () => setActiveSideId(pathName.split('/').at(-1) as string);

    const handleOk = async () => {
        await submitWSbyMonth(current.format('YYYY-MM-DD'));
        notification.success({title: '本月排班已提交', description: `${current.format("YYYY年M月")} 的所有排班已提交!`})
        closeModal();
        refresh();
    };

    const handleCancel = () => {
        closeModal();
    };

    return (
        <>
            <Modal
                title={`确定要提交 ${current.format("YYYY年M月")} 的所有排班吗?`}
                closable={true}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="确定提交"
                cancelText="点错了"
                okButtonProps={{type: "primary"}}
                classNames={{body: 'min-h-3'}}
            >
            </Modal>
        </>
    );
}