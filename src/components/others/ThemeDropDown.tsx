"use client";

import React from "react";
import type {MenuProps} from "antd";
import {ConfigProvider, Dropdown} from "antd";
import {DesktopOutlined, MoonOutlined, SunOutlined} from "@ant-design/icons";
import {ThemeMode, useAppContext} from "@/components/hooks/AppProvider";

export default function ThemeDropDown() {
    const {currentTheme, setCurrentTheme} = useAppContext();

    const handleMenuClick: MenuProps["onClick"] = ({key}) => {
        setCurrentTheme(key as ThemeMode);
    };

    const items: MenuProps["items"] = [
        {
            key: "light",
            icon: <SunOutlined className="text-[15px]"/>,
            label: "浅色模式",
        },
        {
            key: "dark",
            icon: <MoonOutlined className="text-[15px]"/>,
            label: "深色模式",
        },
        {
            key: "system",
            icon: <DesktopOutlined className="text-[15px]"/>,
            label: "跟随系统",
        },
    ];

    const themeIcon = {
        light: <SunOutlined/>,
        dark: <MoonOutlined/>,
        system: <DesktopOutlined/>,
    }[currentTheme];

    return (
        <ConfigProvider
            theme={{
                components: {
                    Dropdown: {
                        colorBgElevated: "#10263b",
                        colorText: "rgba(255,255,255,0.88)",
                        colorSplit: "rgba(255,255,255,0.10)",
                        controlItemBgHover: "rgba(255,255,255,0.08)",
                        borderRadiusLG: 8,
                    },
                },
            }}
        >
            <Dropdown
                trigger={["click"]}
                placement="bottomRight"
                menu={{
                    items,
                    onClick: handleMenuClick,
                    selectable: true,
                    selectedKeys: [currentTheme],
                    className: "!min-w-[160px] !border !border-white/30 !p-1.5 [&_.ant-dropdown-menu-title-content]:font-semibold",
                }}
            >
                <button
                    type="button"
                    className="flex h-[54px] cursor-pointer items-center border-0 bg-transparent px-3 text-white focus:outline-none"
                >
                    <span className="text-[21px]">
                        {themeIcon}
                    </span>
                </button>
            </Dropdown>
        </ConfigProvider>
    );
}
