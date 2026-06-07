import React from "react";
import {AntdRegistry} from '@ant-design/nextjs-registry';
import DesktopMenu from '@/components/menus/DesktopMenu';
import '@/styles/globals.css';

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
        <AntdRegistry>
            <DesktopMenu>
                {children}
            </DesktopMenu>
        </AntdRegistry>
        </body>
        </html>
    )
}