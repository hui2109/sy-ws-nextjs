import {useAppContext} from "@/components/hooks/AppProvider";
import {clearWSbyMonth} from "@/api/WorkSchedule/clearWSbyMonth";
import {Modal} from "antd";
import {useCurrentDateContext} from "@/components/hooks/CurrentDateContext";
import {useSTSideMenuModalContext} from "@/components/hooks/STSideMenuModalContext";

export default function ClearTableModal() {
    const {notification} = useAppContext();
    const {setIsModalOpen} = useSTSideMenuModalContext();
    const {current, refresh} = useCurrentDateContext();

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
                title={`确定要清空 ${current.format("YYYY年M月")} 的所有排班吗?`}
                closable={true}
                open={true}
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