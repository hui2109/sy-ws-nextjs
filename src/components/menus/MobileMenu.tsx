"use client";

import React, {useEffect, useState} from 'react';
import {Drawer, Dropdown, Layout, Menu} from 'antd';
import {AppName} from "@/configs/general";
import {IconFont, IconType} from "@/components/others/IconFont";
import {usePathname, useRouter} from 'next/navigation';
import {useAppContext} from "@/components/hooks/AppProvider";
import {STSideMenuModalContext} from "@/components/hooks/STSideMenuModalContext";
import UserDropDown from "@/components/others/UserDropDown";
import ThemeDropDown from "@/components/others/ThemeDropDown";
import {scheduleToolsMenuBar, statisticsMenuBar} from "@/configs/menuBar";
import {Role} from "@/prisma/generated/enums";
import {getPersonRole} from "@/api/Person/getPersonRole";

const {Header, Content, Footer} = Layout;

const mobileMenu = [
    {title: '我的排班', path: '/mySchedule', icon: IconType.wodepaiban, useSvg: false, iconClass: '!text-green-300'},
    {title: '全科排班', path: '/allSchedule', icon: IconType.quankepaiban, useSvg: false, iconClass: '!text-green-800'},
    {title: '预约休假', path: '/leaveSchedule', icon: IconType.yuyuexiejia, useSvg: false, iconClass: '!text-yellow-400'},
    {title: '假勤申请', path: '/leaveApply', icon: IconType.jiaqinshenqing, useSvg: true, iconClass: ''},
    {title: '统计', path: '/statistics', icon: IconType.tongji, useSvg: true, iconClass: ''}
];

export default function MobileMenu({children}: { children: React.ReactNode }) {
    const {currentUser, resolvedTheme} = useAppContext();
    const pathname = usePathname();
    const router = useRouter();
    const activePath = '/' + pathname.split('/')[1];
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalKey, setModalKey] = useState<string>('');
    const [role, setRole] = useState<Role | null>(null);

    const drawerMenuBar = scheduleToolsMenuBar.map(item =>
        item.key === '/scheduleTools/start'
            ? {...item, onTitleClick: () => setDrawerOpen(false)}
            : item
    );

    const contentTheme = resolvedTheme === 'dark' ? '!bg-[#0f0f0f]' : '!bg-[#f5f5f5]';
    const footerTheme = resolvedTheme === 'dark'
        ? '!bg-[#1f1f1f] border-white/10 shadow-[0_-2px_10px_rgba(0,0,0,0.35)]'
        : '!bg-white border-black/10 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]';
    const menuText = resolvedTheme === 'dark' ? 'text-white/60' : 'text-gray-500';

    useEffect(() => {
        if (!currentUser) return;
        let isMounted = true;

        getPersonRole(currentUser).then(role => {
            if (isMounted) {
                setRole(role)
            }
        })

        return () => {
            isMounted = false;
        };
    }, [currentUser]);

    return (
        <Layout className={`min-h-dvh ${contentTheme}`}>
            <Header className="fixed top-0 left-0 z-50 flex !h-[50px] !w-full items-center justify-between !p-0 shadow-md">
                {currentUser && <UserDropDown/>}
                <div
                    onClick={() => role && role !== 'USER' && setDrawerOpen(true)}
                    className="flex items-center mr-10
                    max-desktop:cursor-pointer"
                >
                    <IconFont type={IconType.wangzhantubiao} className="text-green-600 me-2"/>
                    <span className="text-pink-600 text-lg font-bold tracking-wide">{AppName}</span>
                </div>
                {currentUser && <ThemeDropDown/>}
            </Header>

            <Content className={`pt-[64px] pb-[64px] ${contentTheme}`}>
                <STSideMenuModalContext value={{isModalOpen, setIsModalOpen, modalKey, setModalKey}}>
                    {children}
                </STSideMenuModalContext>
            </Content>

            <Footer className={`fixed bottom-0 left-0 z-50 !flex !h-[64px] !w-full !p-0 border-t ${footerTheme}`}>
                {mobileMenu.map(item => {
                    const menuItem = (
                        <div
                            key={item.path}
                            onClick={item.path === '/statistics' ? undefined : () => router.push(item.path)}
                            className={`flex flex-1 flex-col items-center justify-center gap-1 border-0 bg-transparent ${activePath === item.path ? '!text-[#4978eb]' : menuText}`}
                        >
                            <div className="flex h-6 w-6 items-center justify-center">
                                <IconFont
                                    type={item.icon}
                                    useSvg={item.useSvg}
                                    className={`!text-xl !leading-none ${item.iconClass}`}
                                />
                            </div>
                            <span className="text-xs font-bold">{item.title}</span>
                        </div>
                    );

                    return item.path === '/statistics' ? (
                        <Dropdown
                            key={item.path}
                            trigger={['click']}
                            placement="topRight"
                            arrow
                            menu={{
                                items: statisticsMenuBar,
                                selectedKeys: pathname.startsWith('/statistics/') ? [pathname] : [],
                                onClick: ({key}) => router.push(key),
                            }}
                        >
                            {menuItem}
                        </Dropdown>
                    ) : menuItem;
                })}
            </Footer>

            <Drawer
                title="排班工具"
                placement="left"
                size={300}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                closable={{placement: 'end'}}
                classNames={{body: '!p-2'}}
            >
                <Menu
                    mode="inline"
                    selectedKeys={[pathname]}
                    style={{height: '100%'}}
                    items={drawerMenuBar}
                    openKeys={['/scheduleTools/start']}
                    onClick={({key}) => {
                        if (!key.startsWith('/') && pathname === '/scheduleTools/start' && key !== 'daochupaiban') {
                            setIsModalOpen(true);
                            setModalKey(key);
                        }
                        setDrawerOpen(false);
                    }}
                />
            </Drawer>
        </Layout>
    );
};
