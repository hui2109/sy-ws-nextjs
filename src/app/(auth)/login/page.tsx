"use client";

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {Button, Form, Input, Typography} from "antd";
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {useAppContext} from "@/components/hooks/AppProvider";
import {IconFont, IconType} from "@/assets/icons/IconFont";
import {AppName} from "@/configs/general";
import dayjs from "dayjs";
import {login} from "@/api/Person/login";
import {ILoginFormValues, LoginStatus} from "@/api/Person/types/login.types";
import Link from "next/link";

const {Title, Text} = Typography;

export default function Login() {
    const router = useRouter();
    const {notification, setCurrentUser} = useAppContext();
    const [loading, setLoading] = useState(false);
    const currentYear = dayjs().year();

    const handleSubmit = async (loginFormValues: ILoginFormValues) => {
        setLoading(true);

        const res = await login(loginFormValues);

        switch (res.status) {
            case LoginStatus.NOT_FOUND:
                notification.error({
                    title: "登录失败",
                    description:
                        `${LoginStatus.NOT_FOUND}! ` + "请检查用户名和密码后重试!",
                });
                break;

            case LoginStatus.VERIFY_ERROR:
                notification.error({
                    title: "登录失败",
                    description:
                        `${LoginStatus.VERIFY_ERROR}! ` + "请检查用户名和密码后重试!",
                });
                break;

            case LoginStatus.SUCCESS:
                if (!res.name) break;
                setCurrentUser(res.name);
                notification.success({
                    title: "登录成功",
                    description:
                        `欢迎您, ${res.name} !`,
                });
                router.push("/");
                break;
        }

        setLoading(false);
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4">
            <div className="w-full max-w-[380px]">
                {/* 品牌标识 */}
                <div className="mb-8 flex flex-col items-center">
                    <Title level={3} className="!mb-1 !text-slate-900">
                        欢迎回来
                    </Title>
                    <div className="flex justify-center items-center my-2">
                        <IconFont type={IconType.wangzhantubiao} className="text-green-600 text-4xl me-2"/>
                        <span className="text-pink-600 text-xl font-bold">{AppName}</span>
                    </div>
                    <Text className="text-slate-500">登录您的账号以继续</Text>
                </div>

                {/* 登录卡片 */}
                <div className="rounded-xl border border-slate-200 bg-white px-8 py-9 shadow-sm">
                    <Form<ILoginFormValues>
                        layout="vertical"
                        requiredMark={false}
                        onFinish={handleSubmit}
                    >
                        <Form.Item
                            label="用户名"
                            name="username"
                            rules={[{required: true, message: "请输入用户名"}]}
                        >
                            <Input
                                prefix={<UserOutlined className="text-slate-400"/>}
                                placeholder="请输入用户名"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label="密码"
                            name="password"
                            rules={[{required: true, message: "请输入密码"}]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="text-slate-400"/>}
                                placeholder="请输入密码"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item className="!mb-0">
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                loading={loading}
                                block
                                className="!bg-slate-900 hover:!bg-slate-800"
                            >
                                登录
                            </Button>
                        </Form.Item>

                        <div className="mt-4 flex justify-end">
                            <Link
                                href="/forget"
                                className="text-xs !text-slate-400 transition-colors hover:text-slate-700"
                            >
                                忘记账号或忘记密码？
                            </Link>
                        </div>
                    </Form>
                </div>

                <Text className="absolute bottom-3 inset-x-0 text-center text-xs text-slate-400">
                    Powered by NextJS © {currentYear} Created by Xuhui Zhang
                </Text>
            </div>
        </div>
    );
}
