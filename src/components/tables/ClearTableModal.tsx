import {Modal} from 'antd';
import {useMenuContext} from "@/components/hooks/MenuContext";
import {usePathname, useRouter} from "next/navigation";
import {Dayjs} from "dayjs";
import {clearWSbyMonth} from "@/api/WorkSchedule/clearWSbyMonth";

export default function ClearTableModal({current}: { current: Dayjs }) {
    const {activeSideId, setActiveSideId, notification} = useMenuContext();
    const pathName = usePathname();
    const router = useRouter();
    const isModalOpen = activeSideId === 'qingkongpaiban';

    const handleOk = async () => {
        await clearWSbyMonth(current.format('YYYY-MM-DD'));
        notification.success({title: '本月排班已清空', description: `${current.format("YYYY年M月")} 的所有排班已清空!`})
        setActiveSideId(pathName.split('/').at(-1) as string);
        router.refresh();
    };

    const handleCancel = () => {
        setActiveSideId(pathName.split('/').at(-1) as string);
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
