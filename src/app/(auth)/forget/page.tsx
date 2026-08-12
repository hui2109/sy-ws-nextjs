"use client";

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {Button, Form, Input, Typography} from "antd";
import {IdcardOutlined, LockOutlined, UserOutlined} from "@ant-design/icons";
import {useAppContext} from "@/components/hooks/AppProvider";
import {IconFont, IconType} from "@/assets/icons/IconFont";
import {AppName} from "@/configs/general";
import dayjs from "dayjs";
import Link from "next/link";
import {reset} from "@/api/SessionToken/reset";
import {IResetFormValues, ResetStatus} from "@/api/SessionToken/types/reset.types";

const {Title, Text} = Typography;

export default function Forget() {
    const router = useRouter();
    const {notification} = useAppContext();
    const [loading, setLoading] = useState(false);
    const currentYear = dayjs().year();

    const handleSubmit = async (values: IResetFormValues) => {
        setLoading(true);

        const res = await reset(values);

        switch (res.status) {
            case ResetStatus.NOT_FOUND:
                notification.error({
                    title: "重置失败",
                    description: `${ResetStatus.NOT_FOUND}！请检查姓名和工号后重试!`,
                });
                break;
            case ResetStatus.SUCCESS:
                notification.success({
                    title: "重置成功",
                    description: (
                        <div>
                            <div>账号信息已更新, 欢迎您, {res.name} !</div>
                            <div>您的新用户名为: {res.username}</div>
                            <div>请使用新用户名和密码进行登录!</div>
                        </div>
                    )
                });
                router.push("/login");
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
                        重置账号密码
                    </Title>
                    <div className="flex justify-center items-center my-2">
                        <IconFont type={IconType.wangzhantubiao} className="text-green-600 text-4xl me-2"/>
                        <span className="text-pink-600 text-xl font-bold">{AppName}</span>
                    </div>
                    <Text className="text-slate-500">请填写以下信息完成重置</Text>
                </div>

                {/* 重置卡片 */}
                <div className="rounded-xl border border-slate-200 bg-white px-8 py-9 shadow-sm">
                    <Form<IResetFormValues>
                        layout="vertical"
                        requiredMark={false}
                        onFinish={handleSubmit}
                    >
                        <Form.Item
                            label="姓名"
                            name="name"
                            rules={[{required: true, message: "请输入姓名"}]}
                        >
                            <Input
                                prefix={<UserOutlined className="text-slate-400"/>}
                                placeholder="请输入您的姓名"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label="工号"
                            name="workNumber"
                            rules={[{required: true, message: "请输入工号"}]}
                        >
                            <Input
                                prefix={<IdcardOutlined className="text-slate-400"/>}
                                placeholder="请输入您的工号"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label="新用户名"
                            name="newUsername"
                            rules={[{required: true, message: "请输入新用户名"}]}
                        >
                            <Input
                                prefix={<UserOutlined className="text-slate-400"/>}
                                placeholder="请输入新用户名"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label="新密码"
                            name="newPassword"
                            rules={[{required: true, message: "请输入新密码"}]}
                            hasFeedback
                        >
                            <Input.Password
                                prefix={<LockOutlined className="text-slate-400"/>}
                                placeholder="请输入新密码"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label="确认新密码"
                            name="confirmPassword"
                            dependencies={["newPassword"]}
                            hasFeedback
                            rules={[
                                {required: true, message: "请再次输入新密码"},
                                ({getFieldValue}) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("newPassword") === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("两次输入的密码不一致"));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="text-slate-400"/>}
                                placeholder="请再次输入新密码"
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
                                重置密码
                            </Button>
                        </Form.Item>

                        <div className="mt-4 flex justify-end">
                            <Link
                                href="/login"
                                className="text-xs !text-slate-400 transition-colors hover:text-slate-700"
                            >
                                返回登录
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
