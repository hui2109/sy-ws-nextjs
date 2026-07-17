import {useAppContext} from "@/components/hooks/AppProvider";
import {useSTSideMenuModalContext} from "@/components/hooks/STSideMenuModalContext";
import {useScheduleTableContext} from "@/components/hooks/ScheduleTableContext";
import {Modal} from "antd";
import {exportCurrentTable} from "@/components/utils/exportCurrentTable";

export default function ExportTableModal() {
    const {notification} = useAppContext();
    const {setIsModalOpen} = useSTSideMenuModalContext();
    const {current, scheduleTableRef} = useScheduleTableContext();

    const handleOk = async () => {
        await exportCurrentTable(scheduleTableRef,
            () => {
                notification.success({
                    title: '本月排班已导出',
                    description: `${current.format('YYYY年M月')} 的所有排班已导出!`,
                });
                setIsModalOpen(false);
            },
            () => {
                notification.error({title: '导出失败', description: '请稍后重试!'});
            }
        );
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <Modal
            title={`确定要导出 ${current.format("YYYY年M月")} 的所有排班吗?`}
            closable={true}
            open={true}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="确定导出"
            cancelText="点错了"
            okButtonProps={{type: "primary"}}
            classNames={{body: 'min-h-3'}}
        />
    );
}

