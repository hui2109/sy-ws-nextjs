// "use client";
//
// import React from 'react';
// import type {MenuProps} from 'antd';
// import {ConfigProvider, Layout, Menu, theme} from 'antd';
// import {AppName} from "@/configs/general";
// import {menuBar, MenuBarItem} from "@/configs/menuBar";
// import {IconFont, IconType} from "@/assets/icons/IconFont";
// import {useMenuContext} from "@/components/hooks/AppProvider";
// import {useRouter} from 'next/navigation';
// import {getFarthestURL, getNearestURL} from "@/components/hooks/getActiveMenuID";
//
// const {Header, Content, Footer, Sider} = Layout;
//
// function buildMenuItems(items: MenuBarItem[] | undefined): MenuProps['items'] {
//     if (!items || items.length === 0) return [];
//     return items.map((item) => {
//         const subChildren = 'children' in item && Array.isArray(item.children) && item.children.length > 0
//             ? buildMenuItems(item.children as MenuBarItem[])
//             : undefined;
//         return {
//             key: item.id,
//             label: (
//                 <div className="!text-lg font-bold">
//                     <IconFont type={item.icon.type} useSvg={item.icon.useSvg} className={'me-2 ' + item.icon.className}/>
//                     <b>{item.title}</b>
//                 </div>
//             ),
//             children: subChildren,
//         };
//     });
// }
//
// // 定值menuBar样式
// const menuBarStyle = {
//     components: {
//         Menu: {
//             darkItemSelectedBg: 'transparent',  // 选中项背景色（dark 主题）
//             darkItemSelectedColor: '#4978eb'
//         },
//     },
// }
//
// export default function DesktopMenu({children}: { children: React.ReactNode }): React.ReactNode {
//     const {
//         token: {colorBgContainer, borderRadiusLG},
//     } = theme.useToken();
//     const router = useRouter();
//     const currentYear = new Date().getFullYear();
//     // 获取所有菜单上下文
//     const {activeTopId, activeSideId, setActiveTopId, setActiveSideId} = useMenuContext();
//     // console.log(activeTopId, activeSideId);
//
//     // 获取顶部菜单栏
//     const topMenu: MenuProps['items'] = menuBar.map((item) => (
//         {
//             key: item.id,
//             label: (
//                 <div className="!text-lg font-bold">
//                     <IconFont type={item.icon.type} useSvg={item.icon.useSvg} className={'me-2 ' + item.icon.className}/>
//                     <b>{item.title}</b>
//                 </div>
//             ),
//         }));
//     // 当前选中的顶部菜单项
//     const selectedTopItem = menuBar.find((item) => item.id === activeTopId);
//     // 根据当前选中的顶部菜单项，动态生成侧边栏菜单（核心）
//     const sideMenu: MenuProps['items'] = buildMenuItems(
//         selectedTopItem?.children as MenuBarItem[] | undefined
//     );
//     // 若 children 为空数组，则不显示侧边栏
//     const hasSider = (selectedTopItem?.children?.length ?? 0) > 0;
//
//
//     return (
//         <Layout>
//             <Header className="flex items-center !px-[80px]">
//                 <div className="flex items-center me-4">
//                     <IconFont type={IconType.wangzhantubiao} className="text-green-600 text-4xl me-2"/>
//                     <span className="text-pink-600 text-xl font-bold">{AppName}</span>
//                 </div>
//                 <ConfigProvider
//                     theme={menuBarStyle}
//                 >
//                     <Menu
//                         theme="dark"
//                         mode="horizontal"
//                         selectedKeys={[activeTopId || menuBar[0].id]}
//                         items={topMenu}
//                         style={{flex: 1, minWidth: 0}}
//                         onSelect={({key}) => {
//                             setActiveTopId(key);
//                             const target = getFarthestURL(key);
//                             if (target) router.push(target);
//
//                             // 设置选中的侧边栏菜单项state
//                             const newTopItem = menuBar.find((item) => item.id === key);
//                             setActiveSideId(newTopItem?.children?.[0]?.id || '');
//                         }}
//                     />
//                 </ConfigProvider>
//             </Header>
//             <div className="px-[40px] mt-[30px]">
//                 <Layout
//                     style={{padding: '24px 0', background: colorBgContainer, borderRadius: borderRadiusLG}}
//                 >
//                     {hasSider && (
//                         <Sider style={{background: colorBgContainer}} width={180}>
//                             <Menu
//                                 mode="inline"
//                                 selectedKeys={[activeSideId || menuBar[0]?.children?.[0]?.id || '']}
//                                 defaultOpenKeys={['start']}  // 开始排班 默认展开
//                                 multiple={true}
//                                 style={{height: '100%'}}
//                                 items={sideMenu}
//                                 onSelect={({key}) => {
//                                     setActiveSideId(key);
//                                     const target = getNearestURL(activeTopId, key);
//                                     if (target) router.push(target);
//                                 }}
//                                 onDeselect={({keyPath}) => {
//                                     setActiveSideId(keyPath[keyPath.length - 1]);
//                                 }}
//                             />
//                         </Sider>
//                     )}
//                     <Content className="px-[24px] !min-h-[80vh]">{children}</Content>
//                 </Layout>
//             </div>
//             <Footer style={{textAlign: 'center'}}>Powered by NextJS ©{currentYear} Created by Xuhui Zhang</Footer>
//         </Layout>
//     );
// };
