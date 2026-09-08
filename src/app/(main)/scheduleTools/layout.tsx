'use client';

import {Layout, Menu, theme} from "antd";
import React, {ReactNode, useEffect, useState} from "react";
import {scheduleToolsMenuBar} from "@/configs/menuBar";
import {usePathname} from "next/navigation";
import {STSideMenuModalContext} from "@/components/hooks/STSideMenuModalContext";
import {useAppContext} from "@/components/hooks/AppProvider";
import {Role} from "@/prisma/generated/enums";
import {getPersonRole} from "@/api/Person/getPersonRole";

const {Sider, Content} = Layout;

export default function ScheduleToolsLayout({children}: { children: ReactNode }) {
    const {currentUser} = useAppContext();
    const {token: {colorBgContainer, borderRadiusLG}} = theme.useToken();
    const pathname = usePathname();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalKey, setModalKey] = useState<string>('');
    const [role, setRole] = useState<Role | null>(null);

    useEffect(() => {
        if (!currentUser) return;

        let isMounted = true;

        getPersonRole(currentUser).then(role => {
            if (isMounted) {
                setRole(role);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [currentUser]);

    if (!role) return null;

    const menuItems = role === 'SUPERADMIN'
        ? scheduleToolsMenuBar
        : scheduleToolsMenuBar.map(item => ({
            ...item,
            children: item.children?.filter(child => child.key !== 'shenhepaiban'),
        }));

    return (
        <Layout style={{background: colorBgContainer, borderRadius: borderRadiusLG}}>
            <Sider style={{background: colorBgContainer}} width={180}>
                <Menu
                    mode="inline"
                    selectedKeys={[pathname]}
                    style={{height: '100%'}}
                    items={menuItems}
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
