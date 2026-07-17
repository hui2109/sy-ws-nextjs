import {Modal} from "antd";
import {useCurrentContext} from "@/components/hooks/CurrentContext";
import {exportCurrentTable} from "@/components/utils/exportCurrentTable";
import {RefObject} from "react";
import {useAppContext} from "@/components/hooks/AppProvider";

interface IDownloadTableModal {
    isModalOpen: boolean;
    onClose: () => void;
    allWorkTableRef: RefObject<HTMLDivElement | null>
}

export default function DownloadTableModal({isModalOpen, onClose, allWorkTableRef}: IDownloadTableModal) {
    const {current} = useCurrentContext();
    const {notification} = useAppContext();

    const handleOk = async () => {
        await exportCurrentTable(allWorkTableRef,
            () => {
                notification.success({
                    title: '本月排班已下载',
                    description: `${current.format('YYYY年M月')} 的排班表已下载!`,
                });
                onClose();
            },
            () => {
                notification.error({title: '下载失败', description: '请稍后重试!'});
            }
        );
    };

    return (
        <Modal
            title={`确定要下载 ${current.format("YYYY年M月")} 的排班表吗?`}
            closable={true}
            open={isModalOpen}
            onOk={handleOk}
            onCancel={onClose}
            okText="确定下载"
            cancelText="点错了"
            okButtonProps={{type: "primary"}}
            classNames={{body: 'min-h-3'}}
        />
    );
}