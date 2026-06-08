'use client';

import {createContext, useContext, useState} from "react";
import {menuBar} from "@/configs/menuBar";
import React from "react";

interface MenuContextValue {
    activeTopId: string | null;    // 当前高亮的顶部菜单 id
    activeSideId: string | null;   // 当前高亮的侧边菜单 id
    setActiveTopId: (id: string) => void;
    setActiveSideId: (id: string) => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuProvider({children}: { children: React.ReactNode }) {
    const [activeTopId, setActiveTopId] = useState<string>(menuBar[0].id);
    const [activeSideId, setActiveSideId] = useState<string>(menuBar[0].children[0].id);

    return (
        <MenuContext value={{
            activeTopId,
            activeSideId,
            setActiveTopId,
            setActiveSideId,
        }}>
            {children}
        </MenuContext>
    );
}

export function useMenuContext(): MenuContextValue {
    const context = useContext(MenuContext);
    if (!context) {
        throw new Error("useMenuContext must be used within a MenuProvider");
    }
    return context;
}



