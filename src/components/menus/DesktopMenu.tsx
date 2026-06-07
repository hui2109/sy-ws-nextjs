"use client";

import React from 'react';
import {LaptopOutlined, NotificationOutlined, UserOutlined} from '@ant-design/icons';
import type {MenuProps} from 'antd';
import {Layout, Menu, theme, ConfigProvider} from 'antd';
import {appName} from "@/configs/general";
import {menuBar} from "@/configs/menuBar";
import {IconFont, IconType} from "@/assets/icons/IconFont";

const {Header, Content, Footer, Sider} = Layout;
const topMenu: MenuProps['items'] = menuBar.map((item) => ({
    key: item.id,
    label: (
        <div className="!text-lg font-bold">
            <IconFont type={item.icon.type} useSvg={item.icon.useSvg} className={'me-2 ' + item.icon.className}/>
            <b>{item.title}</b>
        </div>
    ),
}));
const sideMenu: MenuProps['items'] = [UserOutlined, LaptopOutlined, NotificationOutlined].map(
    (icon, index) => {
        const key = String(index + 1);

        return {
            key: `sub${key}`,
            icon: React.createElement(icon),
            label: `subnav ${key}`,
            children: Array.from({length: 4}).map((_, j) => {
                const subKey = index * 4 + j + 1;
                return {
                    key: subKey,
                    label: `option${subKey}`,
                };
            }),
        };
    },
);
// 定值menuBar样式
const menuBarStyle = {
    components: {
        Menu: {
            darkItemSelectedBg: 'transparent',       // 选中项背景色（dark 主题）
            darkItemSelectedColor: '#4978eb'
        },
    },
}

export default function DesktopMenu({children}: { children: React.ReactNode }): React.ReactNode {
    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    const currentYear = new Date().getFullYear();

    return (
        <Layout>
            <Header className="flex items-center !px-[80px]">
                <div className="flex items-center me-4">
                    <IconFont type={IconType.wangzhantubiao} className="text-green-600 text-4xl me-2"/>
                    <span className="text-pink-600 text-xl font-bold">{appName}</span>
                </div>
                <ConfigProvider
                    theme={menuBarStyle}
                >
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        defaultSelectedKeys={['wodepaiban']}
                        items={topMenu}
                        style={{flex: 1, minWidth: 0}}
                    />
                </ConfigProvider>
            </Header>
            <div className="px-[40px] mt-[30px]">
                <Layout
                    style={{padding: '24px 0', background: colorBgContainer, borderRadius: borderRadiusLG}}
                >
                    <Sider style={{background: colorBgContainer}} width={180}>
                        <Menu
                            mode="inline"
                            defaultSelectedKeys={['1']}
                            defaultOpenKeys={['sub1']}
                            style={{height: '100%'}}
                            items={sideMenu}
                        />
                    </Sider>
                    <Content className="px-[24px] !min-h-[80vh]">{children}</Content>
                </Layout>
            </div>
            <Footer style={{textAlign: 'center'}}>Powered by NextJS ©{currentYear} Created by Xuhui Zhang</Footer>
        </Layout>
    );
};
