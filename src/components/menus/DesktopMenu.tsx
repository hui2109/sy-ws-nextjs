"use client";

import React from 'react';
import {ConfigProvider, Layout, Menu, theme} from 'antd';
import {AppName} from "@/configs/general";
import {IconFont, IconType} from "@/assets/icons/IconFont";
import {usePathname} from 'next/navigation';
import dayjs from "dayjs";
import {menuBarStyle, topMenuBar} from "@/configs/menuBar";
import Link from "next/link";

const {Header, Content, Footer} = Layout;

export default function DesktopMenu({children}: { children: React.ReactNode }): React.ReactNode {
    const {token: {colorBgContainer, borderRadiusLG}} = theme.useToken();
    const pathname = usePathname();
    const currentYear = dayjs().year();

    return (
        <Layout>
            <Header
                className="flex items-center justify-center !px-0 shadow-md"
            >
                <div className="flex items-center w-full max-w-[1300px] mx-auto px-6">
                    <Link href='/'>
                        <div className="flex items-center me-4 ms-[30px]">
                            <IconFont type={IconType.wangzhantubiao} className="text-green-600 text-4xl me-2"/>
                            <span className="text-pink-600 text-xl font-bold tracking-wide">{AppName}</span>
                        </div>
                    </Link>
                    <ConfigProvider theme={menuBarStyle}>
                        <Menu
                            theme="dark"
                            mode="horizontal"
                            selectedKeys={['/' + pathname.split('/')[1]]}
                            defaultSelectedKeys={['/scheduleTools']}
                            items={topMenuBar}
                            style={{flex: 1, minWidth: 0, background: 'transparent'}}
                        />
                    </ConfigProvider>
                </div>
            </Header>

            <Content className="pt-[18px] pb-[10px] max-w-[1300px] mx-auto w-full">
                <div className={'min-h-[80vh] p-4'}
                     style={{
                         background: colorBgContainer,
                         borderRadius: borderRadiusLG,
                     }}
                >
                    {children}
                </div>
            </Content>
            <Footer className="text-center !px-[50px] !py-[0px]">Powered by NextJS © {currentYear} Created by Xuhui Zhang</Footer>
        </Layout>
    );
};
