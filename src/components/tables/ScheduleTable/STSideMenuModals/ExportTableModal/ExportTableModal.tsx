import {useAppContext} from "@/components/hooks/AppProvider";
import {useSTSideMenuModalContext} from "@/components/hooks/STSideMenuModalContext";
import {useScheduleTableContext} from "@/components/hooks/ScheduleTableContext";
import {Modal} from "antd";
import {exportCurrentTable} from "@/components/utils/exportCurrentTable";

export default function ExportTableModal() {
    const {notification, currentTheme, setCurrentTheme, resolvedTheme} = useAppContext();
    const {setIsModalOpen} = useSTSideMenuModalContext();
    const {current, scheduleTableRef} = useScheduleTableContext();

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
        } finally {
            if (isDark) {
                setCurrentTheme(currentTheme);
            }
        }
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

