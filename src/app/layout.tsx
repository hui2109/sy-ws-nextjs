import {SerwistProvider} from "@serwist/turbopack/react";
import {ReactNode} from "react";
import type {Metadata, Viewport} from "next";
import {AntdRegistry} from "@ant-design/nextjs-registry";
import "@/styles/globals.css";
import {AppProvider} from "@/components/hooks/AppProvider";
import {cookies} from "next/headers";
import {verifySessionToken} from "@/api/SessionToken/session";
import {AppName} from "@/configs/general";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

dayjs.locale("zh-cn");

export const metadata: Metadata = {
    applicationName: AppName,
    title: {
        default: AppName,
        template: `%s | ${AppName}`,
    },
    description: "排班、休假及假勤管理系统",
    appleWebApp: {
        capable: true,
        title: AppName,
        statusBarStyle: "default",
    },
    formatDetection: {
        telephone: false,
    },
};

export const viewport: Viewport = {
    themeColor: [
        {media: "(prefers-color-scheme: light)", color: "#f5f5f5"},
        {media: "(prefers-color-scheme: dark)", color: "#101111"},
    ],
};

export default async function RootLayout({children}: { children: ReactNode }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    let initialUser: string | null = null;

    if (token) {
        const session = await verifySessionToken(token);

        if (session) {
            initialUser = session.name;
        }
    }

    return (
        <html lang="zh-CN">
        <body>
        <SerwistProvider swUrl="/serwist/sw.js">
            <AntdRegistry>
                <AppProvider initialUser={initialUser}>
                    {children}
                </AppProvider>
            </AntdRegistry>
        </SerwistProvider>
        </body>
        </html>
    );
}
