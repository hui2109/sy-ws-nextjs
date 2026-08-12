'use client';

import React, {createContext, Dispatch, SetStateAction, useContext, useState} from "react";
import {ConfigProvider, notification} from "antd";
import locale from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import {NotificationInstance} from "antd/es/notification/interface";

dayjs.locale('zh-cn');

interface IAppContext {
    notification: NotificationInstance;
    currentUser: string | null;
    setCurrentUser: Dispatch<SetStateAction<string | null>>;
}

export const AppContext = createContext<IAppContext | null>(null);

export function AppProvider({initialUser, children}: { initialUser: string | null; children: React.ReactNode }) {
    const [api, contextHolder] = notification.useNotification({placement: "topRight", showProgress: true, pauseOnHover: true, duration: 2.3});
    const [currentUser, setCurrentUser] = useState<string | null>(initialUser);

    return (
        <ConfigProvider locale={locale}>
            {contextHolder}
            <AppContext value={{
                notification: api,
                currentUser,
                setCurrentUser
            }}>
                {children}
            </AppContext>
        </ConfigProvider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
