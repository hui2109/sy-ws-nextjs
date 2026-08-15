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
    const {notification, currentTheme, setCurrentTheme, resolvedTheme} = useAppContext();

    // 等待主题切换触发的重新渲染 + antd 动态样式表完全生效后，再进行截图导出
    const waitForThemeApplied = () =>
        new Promise<void>(resolve => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTimeout(resolve, 50);
                });
            });
        });

    const handleOk = async () => {
        // 深色模式下不能直接导出，需要先临时切成浅色模式，导出完成后再切回去
        const isDark = resolvedTheme === 'dark';
        try {
            if (isDark) {
                setCurrentTheme('light');
                await waitForThemeApplied();
            }

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
        } finally {
            if (isDark) {
                setCurrentTheme(currentTheme);
            }
        }
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