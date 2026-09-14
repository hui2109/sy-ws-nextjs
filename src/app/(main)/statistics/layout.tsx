'use client';

import {Layout, Menu, theme} from "antd";
import React, {ReactNode} from "react";
import {statisticsMenuBar} from "@/configs/menuBar";
import {usePathname} from "next/navigation";
import {useAppContext} from "@/components/hooks/AppProvider";

const {Sider, Content} = Layout;

export default function ScheduleToolsLayout({children}: { children: ReactNode }) {
    const {token: {colorBgContainer, borderRadiusLG}} = theme.useToken();
    const pathname = usePathname();
    const {resolvedViewport} = useAppContext();

    return resolvedViewport === 'desktop' ? (
        <Layout style={{background: colorBgContainer, borderRadius: borderRadiusLG}}>
            <Sider style={{background: colorBgContainer}} width={180}>
                <Menu
                    mode="inline"
                    selectedKeys={[pathname]}
                    style={{height: '100%'}}
                    items={statisticsMenuBar}
                />
            </Sider>
            <Content className="pl-[24px] !min-h-[80vh]">
                {children}
            </Content>
        </Layout>
    ) : children;
}
