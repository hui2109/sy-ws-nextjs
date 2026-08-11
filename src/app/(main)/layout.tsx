import {ReactNode} from "react";
import DesktopMenu from "@/components/menus/DesktopMenu";

export default function MainLayout({children}: { children: ReactNode }) {
    return (
        <DesktopMenu>
            {children}
        </DesktopMenu>
    );
}
