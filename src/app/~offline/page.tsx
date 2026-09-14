"use client";

import {Button, Result} from "antd";

export default function OfflinePage() {
    return (
        <div className="flex min-h-dvh items-center justify-center px-4">
            <Result
                status="warning"
                title="当前处于离线状态"
                subTitle="无法连接服务器，请检查网络后重试。为保证数据实时性，排班、假勤及用户数据不会使用离线缓存。"
                extra={
                    <Button type="primary" onClick={() => window.location.reload()}>
                        重新连接
                    </Button>
                }
            />
        </div>
    );
}
