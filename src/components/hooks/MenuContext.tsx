'use client';

import React, {createContext, useContext, useState} from "react";
import {usePathname} from "next/navigation";
import {getActiveMenuIDbyPathName} from "@/components/hooks/getActiveMenuID";
import {ConfigProvider, notification} from "antd";
import locale from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import {NotificationInstance} from "antd/es/notification/interface";

dayjs.locale('zh-cn');

interface MenuContextValue {
    activeTopId: string | null;    // 当前高亮的顶部菜单 id
    activeSideId: string | null;   // 当前高亮的侧边菜单 id
    setActiveTopId: (id: string) => void;
    setActiveSideId: (id: string) => void;
    notification: NotificationInstance;
}

const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuProvider({children}: { children: React.ReactNode }) {
    const pathName = usePathname();
    const [activeTopId, setActiveTopId] = useState<string>(() => getActiveMenuIDbyPathName(pathName)[0]);
    const [activeSideId, setActiveSideId] = useState<string>(() => getActiveMenuIDbyPathName(pathName)[1]);
    const [api, contextHolder] = notification.useNotification({placement: "topRight", showProgress: true, pauseOnHover: true, duration: 3});

    return (
        <ConfigProvider locale={locale}>
            {contextHolder}
            <MenuContext value={{
                activeTopId,
                activeSideId,
                setActiveTopId,
                setActiveSideId,
                notification: api
            }}>
                {children}
            </MenuContext>
        </ConfigProvider>
    );
}

export function useMenuContext(): MenuContextValue {
    const context = useContext(MenuContext);
    if (!context) {
        throw new Error("useMenuContext must be used within a MenuProvider");
    }
    return context;
}



