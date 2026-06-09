"use client";

import React from 'react';
import type {MenuProps} from 'antd';
import {ConfigProvider, Layout, Menu, theme} from 'antd';
import {appName} from "@/configs/general";
import {menuBar, MenuBarItem} from "@/configs/menuBar";
import {IconFont, IconType} from "@/assets/icons/IconFont";
import {useMenuContext} from "@/components/hooks/MenuContext";
import {useRouter} from 'next/navigation';

const {Header, Content, Footer, Sider} = Layout;

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

function getFarthestURL(activeTopId: string): string | null {
    const topItem = menuBar.find((item) => item.id === activeTopId);
    if (!topItem) return null;

    function findDeepestPath(item: MenuBarItem): string | null {
        if (item.children?.[0]) {
            const childPath = findDeepestPath(item.children[0]);
            if (childPath) return childPath;
        }
        return item.path ?? null;
    }

    return findDeepestPath(topItem);
}

function getNearestURL(activeTopId: string | null, activeSideId: string): string | null {
    const topItem = menuBar.find((item) => item.id === activeTopId);
    if (!topItem) return null;

    function findPathById(item: MenuBarItem, nearestAncestorPath: string | null): string | null {
        const currentPath = item.path ?? nearestAncestorPath;

        if (item.id === activeSideId) {
            return item.path ?? nearestAncestorPath;
        }
        if (item.children) {
            for (const child of item.children) {
                const found = findPathById(child, currentPath);
                if (found) return found;
            }
        }
        return null;
    }

    return findPathById(topItem, null) ?? topItem.path ?? null;
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
    const router = useRouter();
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
    // 根据当前选中的顶部菜单项，动态生成侧边栏菜单（核心）
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
                            const target = getFarthestURL(key);
                            if (target) router.push(target);

                            // 设置选中的侧边栏菜单项state
                            const newTopItem = menuBar.find((item) => item.id === key);
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
                                onSelect={({key}) => {
                                    setActiveSideId(key);
                                    const target = getNearestURL(activeTopId, key);
                                    if (target) router.push(target);
                                }}
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
