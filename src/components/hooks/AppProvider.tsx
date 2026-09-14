'use client';

import React, {createContext, Dispatch, SetStateAction, useContext, useEffect, useState} from "react";
import {ConfigProvider, notification, theme} from "antd";
import locale from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import {NotificationInstance} from "antd/es/notification/interface";
import {DESKTOP_BREAKPOINT} from "@/configs/general";

dayjs.locale('zh-cn');
export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = Exclude<ThemeMode, "system">;
export type ViewportType = 'desktop' | 'mobile' | null;
export type ResolvedViewport = Exclude<ViewportType, null>;

interface IAppContext {
    notification: NotificationInstance;
    currentUser: string | null;
    setCurrentUser: Dispatch<SetStateAction<string | null>>;
    currentTheme: ThemeMode;
    setCurrentTheme: Dispatch<SetStateAction<ThemeMode>>;
    resolvedTheme: ResolvedTheme;
    resolvedViewport: ResolvedViewport;
}

export const AppContext = createContext<IAppContext | null>(null);

export function AppProvider({initialUser, children}: { initialUser: string | null; children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<string | null>(initialUser);
    const [currentTheme, setCurrentTheme] = useState<ThemeMode>('system');
    const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light');
    const [viewport, setViewport] = useState<ViewportType>(null);
    const [api, contextHolder] = notification.useNotification({
        placement: viewport === 'desktop' ? 'topRight' : 'top',
        showProgress: true,
        pauseOnHover: true,
        duration: 2.3
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const updateSystemTheme = () => {
            setSystemTheme(mediaQuery.matches ? "dark" : "light");
        };

        // 首次挂载时读取系统主题
        updateSystemTheme();

        // 系统主题切换时自动更新
        mediaQuery.addEventListener("change", updateSystemTheme);

        return () => {
            mediaQuery.removeEventListener("change", updateSystemTheme);
        };
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
        const updateViewport = () => {
            setViewport(mediaQuery.matches ? 'desktop' : 'mobile');
        };

        // 首次读取窗口大小
        updateViewport();

        // 这里不会在每次 resize 时都触发, 只有窗口跨过 1090px 这个临界点时, change 才会触发
        mediaQuery.addEventListener('change', updateViewport);

        return () => {
            mediaQuery.removeEventListener('change', updateViewport);
        };
    }, []);

    const resolvedTheme: ResolvedTheme = currentTheme === 'system' ? systemTheme : currentTheme;
    const resolvedViewport: ResolvedViewport = viewport ? viewport : 'mobile';

    return (
        <ConfigProvider
            locale={locale}
            theme={{
                algorithm: resolvedTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: resolvedTheme === 'dark' ? {
                    // 页面整体背景
                    colorBgLayout: '#101111',
                    // Card、Form 等普通容器
                    colorBgContainer: '#1d1f1f',
                    // Modal、Dropdown、Popover 等浮层
                    colorBgElevated: '#292c2c',
                    // 整体边框
                    colorBorderSecondary: '#303333',
                } : {},
                components: {
                    ...(resolvedTheme === 'dark' ? {
                        Table: {
                            // Table 主体比 Card 再深一层
                            colorBgContainer: '#181a1a',
                            // 表头稍微亮于表体
                            headerBg: '#202323',
                            // hover 不要太亮
                            rowHoverBg: '#232626',
                            // 表格线
                            borderColor: '#2b2e2e',
                            headerSplitColor: '#2b2e2e',
                        },
                    } : {}),
                    ...(resolvedViewport === 'mobile' ? {
                        Notification: {
                            width: 300,
                            fontSize: 13,
                            fontSizeLG: 14,
                            lineHeight: 1.45,
                            lineHeightLG: 1.4,
                            paddingMD: 12,
                            paddingLG: 14,
                            paddingContentHorizontalLG: 14,
                            margin: 10,
                            marginLG: 12,
                            marginSM: 8,
                            marginXS: 6,
                            borderRadiusLG: 8,
                        },
                    } : {}),
                    Menu: {
                        subMenuItemBg: 'transparent',
                    },
                }
            }}
        >
            <ThemeBackground>
                {contextHolder}
                <AppContext value={{
                    notification: api,
                    currentUser,
                    setCurrentUser,
                    currentTheme,
                    setCurrentTheme,
                    resolvedTheme,
                    resolvedViewport,
                }}>
                    {children}
                </AppContext>
            </ThemeBackground>
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

function ThemeBackground({children}: { children: React.ReactNode }) {
    const {token} = theme.useToken();

    return (
        <div className="min-h-dvh" style={{backgroundColor: token.colorBgLayout}}>
            {children}
        </div>
    );
}
