'use client';

import {ReactNode} from "react";
import DesktopMenu from "@/components/menus/DesktopMenu";
import MobileMenu from "@/components/menus/MobileMenu";
import {useAppContext} from "@/components/hooks/AppProvider";

export default function MainLayout({children}: { children: ReactNode }) {
    const {resolvedViewport} = useAppContext();
    const Menu = resolvedViewport === "mobile" ? MobileMenu : DesktopMenu;

    return <Menu>{children}</Menu>;
}
