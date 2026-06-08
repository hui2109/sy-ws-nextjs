"use client";

import React from 'react';
import type {MenuProps} from 'antd';
import {Layout, Menu, theme, ConfigProvider} from 'antd';
import {appName} from "@/configs/general";
import {menuBar} from "@/configs/menuBar";
import {IconFont, IconType} from "@/assets/icons/IconFont";
import {useMenuContext} from "@/components/hooks/MenuContext";

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
    // 获取所有菜单上下文
    const {activeTopId, setActiveTopId, setActiveSideId} = useMenuContext();

    // 获取顶部菜单栏
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
    // 当前选中的顶部菜单项
    const selectedTopItem = menuBar.find((item) => item.id === activeTopId);
    // 根据选中的顶部菜单项，动态生成侧边栏菜单（核心）
    const sideMenu: MenuProps['items'] = buildMenuItems(
        selectedTopItem?.children as MenuBarItem[] | undefined
    );
    // 若 children 为空数组，则不显示侧边栏
    const hasSider = (selectedTopItem?.children?.length ?? 0) > 0;

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
                        onSelect={({key}) => {
                            setActiveTopId(key);
                            // 设置选中的侧边栏菜单项state
                            const newTopItem = menuBar.find((item) => item.id === key);  // 用 key 查新项
                            setActiveSideId(newTopItem?.children?.[0]?.id || '');
                        }}
                    />
                </ConfigProvider>
            </Header>
            <div className="px-[40px] mt-[30px]">
                <Layout
                    style={{padding: '24px 0', background: colorBgContainer, borderRadius: borderRadiusLG}}
                >
                    {hasSider && (
                        <Sider style={{background: colorBgContainer}} width={180}>
                            <Menu
                                mode="inline"
                                style={{height: '100%'}}
                                items={sideMenu}
                                onSelect={({key}) => setActiveSideId(key)}
                            />
                        </Sider>
                    )}
                    <Content className="px-[24px] !min-h-[80vh]">{children}</Content>
                </Layout>
            </div>
            <Footer style={{textAlign: 'center'}}>Powered by NextJS ©{currentYear} Created by Xuhui Zhang</Footer>
        </Layout>
    );
};
