import React from "react";
import {AntdRegistry} from '@ant-design/nextjs-registry';
import DesktopMenu from '@/components/menus/DesktopMenu';
import '@/styles/globals.css';
import {AppProvider} from "@/components/hooks/AppProvider";
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
        <AntdRegistry>
            <AppProvider>
                <DesktopMenu>
                    {children}
                </DesktopMenu>
            </AppProvider>
        </AntdRegistry>
        </body>
        </html>
    )
}