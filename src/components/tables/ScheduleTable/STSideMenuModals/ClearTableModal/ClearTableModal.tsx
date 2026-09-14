import {useAppContext} from "@/components/hooks/AppProvider";
import {clearWSbyMonth} from "@/api/WorkSchedule/clearWSbyMonth";
import {Modal} from "antd";
import {useScheduleTableContext} from "@/components/hooks/ScheduleTableContext";
import {useSTSideMenuModalContext} from "@/components/hooks/STSideMenuModalContext";

export default function ClearTableModal() {
    const {notification, resolvedViewport} = useAppContext();
    const {setIsModalOpen} = useSTSideMenuModalContext();
    const {current, refresh} = useScheduleTableContext();

    const handleOk = async () => {
        await clearWSbyMonth(current.format('YYYY-MM-DD'));
        notification.success({title: '本月排班已清空', description: `${current.format("YYYY年M月")} 的所有排班已清空!`})
        setIsModalOpen(false);
        refresh();
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Modal
                width={resolvedViewport === 'mobile' ? 360 : undefined}
                title={`确定要清空 ${current.format("YYYY年M月")} 的所有排班吗?`}
                closable={true}
                open={true}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="确定清除"
                cancelText="点错了"
                okButtonProps={{danger: true, size: resolvedViewport === 'mobile' ? 'small' : 'middle'}}
                cancelButtonProps={{size: resolvedViewport === 'mobile' ? 'small' : 'middle'}}
                classNames={{body: 'min-h-3'}}
            >
            </Modal>
        </>
    );
};