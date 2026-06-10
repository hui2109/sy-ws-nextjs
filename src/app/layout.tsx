import React from "react";
import {AntdRegistry} from '@ant-design/nextjs-registry';
import DesktopMenu from '@/components/menus/DesktopMenu';
import '@/styles/globals.css';
import {MenuProvider} from "@/components/hooks/MenuContext";


export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
        <AntdRegistry>
            <MenuProvider>
                <DesktopMenu>
                    {children}
                </DesktopMenu>
            </MenuProvider>
        </AntdRegistry>
        </body>
        </html>
    )
}