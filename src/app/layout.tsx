import {ReactNode} from "react";
import {AntdRegistry} from "@ant-design/nextjs-registry";
import "@/styles/globals.css";
import {AppProvider} from "@/components/hooks/AppProvider";
import {cookies} from "next/headers";
import {verifySessionToken} from "@/api/SessionToken/session";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

dayjs.locale("zh-cn");

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
        <AntdRegistry>
            <AppProvider initialUser={initialUser}>
                {children}
            </AppProvider>
        </AntdRegistry>
        </body>
        </html>
    );
}
