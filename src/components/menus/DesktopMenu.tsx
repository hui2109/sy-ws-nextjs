"use client";

import React, {useState} from 'react';
import type {MenuProps} from 'antd';
import {Layout, Menu, theme, ConfigProvider} from 'antd';
import {appName} from "@/configs/general";
import {menuBar} from "@/configs/menuBar";
import {IconFont, IconType} from "@/assets/icons/IconFont";

const {Header, Content, Footer, Sider} = Layout;

/** 递归将 menuBar 的 children 转换为 Ant Design Menu items 格式 */
type MenuBarItem = (typeof menuBar)[0]['children'][0];

function buildMenuItems(items: MenuBarItem[] | undefined): MenuProps['items'] {
    if (!items || items.length === 0) return [];
    return items.map((item) => {
        const subChildren = 'children' in item && Array.isArray(item.children) && item.children.length > 0
            ? buildMenuItems(item.children as MenuBarItem[])
            : undefined;
        return {
            key: item.id,
            label: (
                <div className="!text-lg font-bold">
                    <IconFont type={item.icon.type} useSvg={item.icon.useSvg} className={'me-2 ' + item.icon.className}/>
                    <b>{item.title}</b>
                </div>
            ),
            children: subChildren,
        };
    });
}

const topMenu: MenuProps['items'] = menuBar.map((item) => (
    {
        key: item.id,
        label: (
            <div className="!text-lg font-bold">
                <IconFont type={item.icon.type} useSvg={item.icon.useSvg} className={'me-2 ' + item.icon.className}/>
                <b>{item.title}</b>
            </div>
        ),
    }));

// 定值menuBar样式
const menuBarStyle = {
    components: {
        Menu: {
            darkItemSelectedBg: 'transparent',  // 选中项背景色（dark 主题）
            darkItemSelectedColor: '#4978eb'
        },
    },
}

export default function DesktopMenu({children}: { children: React.ReactNode }): React.ReactNode {
    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    const currentYear = new Date().getFullYear();

    // 记录当前选中的顶部菜单项 id，默认为第一项
    const [selectedTopKey, setSelectedTopKey] = useState<string>(menuBar[0].id);

    // 根据选中的顶部菜单项，动态生成侧边栏菜单（核心）
    const sideMenu: MenuProps['items'] = buildMenuItems(
        menuBar.find((item) => item.id === selectedTopKey)?.children as MenuBarItem[] | undefined
    );

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
                        defaultSelectedKeys={[menuBar[0].id]}
                        items={topMenu}
                        style={{flex: 1, minWidth: 0}}
                        onSelect={({key}) => setSelectedTopKey(key)}
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
