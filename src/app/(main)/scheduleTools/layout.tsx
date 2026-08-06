'use client';

import {Layout, Menu, theme} from "antd";
import React, {ReactNode, useState} from "react";
import {scheduleToolsMenuBar} from "@/configs/menuBar";
import {usePathname} from "next/navigation";
import {STSideMenuModalContext} from "@/components/hooks/STSideMenuModalContext";

const {Sider, Content} = Layout;

export default function ScheduleToolsLayout({children}: { children: ReactNode }) {
    const {token: {colorBgContainer, borderRadiusLG}} = theme.useToken();
    const pathname = usePathname();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalKey, setModalKey] = useState<string>('');

    return (
        <Layout style={{background: colorBgContainer, borderRadius: borderRadiusLG}}>
            <Sider style={{background: colorBgContainer}} width={180}>
                <Menu
                    mode="inline"
                    selectedKeys={[pathname]}
                    style={{height: '100%'}}
                    items={scheduleToolsMenuBar}
                    openKeys={['/scheduleTools/start']}
                    onClick={({key}) => {
                        setIsModalOpen(true);
                        setModalKey(key);
                    }}
                />
            </Sider>
            <Content className="pl-[24px] !min-h-[80vh]">
                <STSideMenuModalContext value={{isModalOpen, setIsModalOpen, modalKey, setModalKey}}>
                    {children}
                </STSideMenuModalContext>
            </Content>
        </Layout>
    );
}
