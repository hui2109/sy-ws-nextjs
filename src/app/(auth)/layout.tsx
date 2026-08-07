import React from "react";
import {AntdRegistry} from '@ant-design/nextjs-registry';
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
                {children}
            </AppProvider>
        </AntdRegistry>
        </body>
        </html>
    )
}