import {RefObject} from "react";
import {toPng} from "html-to-image";

export async function exportCurrentTable(scheduleTableRef: RefObject<HTMLDivElement | null>, successCallback: () => void, errorCallback: () => void) {
    const container = scheduleTableRef.current;
    if (!container) return;

    const scheduleTableTitle = document.querySelector<HTMLElement>('#scheduleTableTitle');
    if (!scheduleTableTitle) return;

    // 1. 整体 clone 表格容器，不碰原始 DOM
    const containerClone = container.cloneNode(true) as HTMLElement;

    containerClone.style.overflow = 'visible';
    containerClone.style.maxWidth = 'none';
    containerClone.style.position = 'static';

    const cloneBody = containerClone.querySelector<HTMLElement>('.ant-table-body');
    if (cloneBody) {
        cloneBody.style.overflow = 'visible';
        cloneBody.style.maxHeight = 'none';
    }

    const cloneDefaultTitle = containerClone.querySelector<HTMLElement>('.ant-table-title');
    if (cloneDefaultTitle) {
        cloneDefaultTitle.style.display = 'none';
    }

    const titleClone = scheduleTableTitle.cloneNode(true) as HTMLElement;
    containerClone.insertBefore(titleClone, containerClone.firstChild);

    // 新增：专门负责留白 + 背景色的"画框"，截图对象改成这一层
    const paddingWrapper = document.createElement('div');
    paddingWrapper.style.display = 'inline-block'; // 让宽度随内容撑开，而不是占满一整行
    paddingWrapper.style.padding = '32px';          // 留白大小，按需调整
    paddingWrapper.style.background = '#fff';       // 留白区域的颜色，要和 toPng 的 backgroundColor 保持一致

    // 藏身包裹层，逻辑不变
    const hiddenWrapper = document.createElement('div');
    hiddenWrapper.style.position = 'fixed';
    hiddenWrapper.style.top = '0';
    hiddenWrapper.style.left = '0';
    hiddenWrapper.style.width = '0';
    hiddenWrapper.style.height = '0';
    hiddenWrapper.style.overflow = 'hidden';

    paddingWrapper.appendChild(containerClone);
    hiddenWrapper.appendChild(paddingWrapper);
    document.body.appendChild(hiddenWrapper);

    try {
        const dataUrl = await toPng(paddingWrapper, {
            pixelRatio: 10,
            backgroundColor: '#fff',
        });

        const link = document.createElement('a');
        link.download = 'CurrentTable.png';
        link.href = dataUrl;
        link.click();
        successCallback();
    } catch (error) {
        console.error('导出失败:', error);
        errorCallback()
    } finally {
        document.body.removeChild(hiddenWrapper);
    }
}