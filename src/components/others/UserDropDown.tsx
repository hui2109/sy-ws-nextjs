"use client";

import React, {useEffect, useRef, useState} from "react";
import type {MenuProps, UploadProps} from "antd";
import {Avatar, ConfigProvider, Dropdown, Spin, Upload} from "antd";
import {LoadingOutlined, LogoutOutlined, ReloadOutlined, UploadOutlined, UserOutlined,} from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import {logout} from "@/api/SessionToken/logout";
import {useAppContext} from "@/components/hooks/AppProvider";
import {saveAvatar} from "@/api/Person/saveAvatar";
import {getAvatar} from "@/api/Person/getAvatar";

export default function UserDropDown() {
    const {notification, currentUser} = useAppContext();
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
    const avatarObjectUrlRef = useRef<string | null>(null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const hiddenUploadRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return () => {
            if (avatarObjectUrlRef.current) {
                URL.revokeObjectURL(avatarObjectUrlRef.current);
            }
        };
    }, []);

    useEffect(() => {
        let isMounted = true;
        if (!currentUser) return;

        getAvatar(currentUser).then(r => {
            if (isMounted) {
                setCurrentAvatarUrl(r)
            }
        })

        return () => {
            isMounted = false;
        };
    }, [currentUser]);

    if (!currentUser) return null;

    const beforeAvatarUpload = (file: File) => {
        const isImage = file.type.startsWith("image/");
        if (!isImage) {
            notification.error({
                title: '上传失败',
                description: '只能上传图片文件!'
            });
            return Upload.LIST_IGNORE;
        }

        // 图片大小不受限制
        // const isLt5M = file.size / 1024 / 1024 < 5;
        // if (!isLt5M) {
        //     message.error("图片大小不能超过 5MB");
        //     return Upload.LIST_IGNORE;
        // }

        return true;
    };

    // antd-img-crop 会在 beforeUpload 校验通过后先弹出裁剪框，
    // 用户确认裁剪后再把裁剪好的文件交给下面的 customRequest 上传。
    const customUploadRequest: UploadProps["customRequest"] = async (options) => {
        const {file, onSuccess, onError} = options;
        const rawFile = file as File;

        // 本地即时预览（裁剪后的图片），提升体验
        if (avatarObjectUrlRef.current) {
            URL.revokeObjectURL(avatarObjectUrlRef.current);
        }
        const previewUrl = URL.createObjectURL(rawFile);
        avatarObjectUrlRef.current = previewUrl;
        setCurrentAvatarUrl(previewUrl);
        setAvatarUploading(true);

        try {
            const avatarUrl = await saveAvatar(currentUser, rawFile);
            onSuccess?.({url: avatarUrl}, rawFile);
            // 上传成功后改用服务器返回的正式地址，释放本地预览 URL
            if (avatarObjectUrlRef.current) {
                URL.revokeObjectURL(avatarObjectUrlRef.current);
                avatarObjectUrlRef.current = null;
            }
            setCurrentAvatarUrl(avatarUrl);
            notification.success({
                title: '上传成功',
                description: '头像更新成功!'
            });
        } catch (err) {
            const error = err as Error;
            onError?.(error);
            notification.error({
                title: '上传失败',
                description: (
                    <div>
                        <span>头像上传失败，请重试!</span>
                        <span>{error.message}</span>
                    </div>
                )
            });
        } finally {
            setAvatarUploading(false);
        }
    };

    const onForceUpdate = () => {
        window.location.reload();
    };

    const onLogout = async () => {
        await logout();
    };

    const handleMenuClick: MenuProps["onClick"] = ({key}) => {
        switch (key) {
            case "refresh":
                onForceUpdate();
                break;
            case "logout":
                onLogout().then();
                break;
            case "avatar":
                hiddenUploadRef.current
                    ?.querySelector<HTMLInputElement>('input[type="file"]')
                    ?.click();
                break;
        }
    };

    const items: MenuProps["items"] = [
        {
            key: "avatar",
            icon: <UploadOutlined className="text-[15px]"/>,
            label: "修改头像",
        },
        {
            key: "refresh",
            icon: <ReloadOutlined className="text-[15px]"/>,
            label: "强制更新",
        },
        {
            type: "divider",
        },
        {
            key: "logout",
            danger: true,
            icon: <LogoutOutlined className="text-[15px]"/>,
            label: "退出登录",
        },
    ];

    return (
        <ConfigProvider
            theme={{
                components: {
                    Dropdown: {
                        colorBgElevated: "#10263b",
                        colorText: "rgba(255,255,255,0.88)",
                        colorSplit: "rgba(255,255,255,0.10)",
                        controlItemBgHover: "rgba(255,255,255,0.08)",
                        borderRadiusLG: 8,
                    },
                },
            }}
        >
            <Dropdown
                trigger={["click"]}
                placement="bottomRight"
                menu={{
                    items,
                    onClick: handleMenuClick,
                    className: '!min-w-[160px] !border !border-white/30 !p-1.5 [&_.ant-dropdown-menu-title-content]:font-semibold',
                }}
            >
                <button
                    type="button"
                    className="ml-2 flex h-[46px] cursor-pointer items-center gap-2 border-0 bg-transparent px-3 text-white focus:outline-none"
                >
                    <span className="relative inline-flex h-[28px] w-[28px]">
                        <Avatar
                            size={28}
                            src={currentAvatarUrl}
                            icon={!currentAvatarUrl ? <UserOutlined/> : undefined}
                            className="!bg-blue-600 ring-1 ring-white/20"
                        />
                        {avatarUploading && (
                            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                                <Spin size="small" indicator={<LoadingOutlined className="text-xs text-white" spin/>}/>
                            </span>
                        )}
                    </span>
                    <span className="max-w-[120px] truncate text-sm font-semibold tracking-wide text-white/90">
                        {currentUser}
                    </span>
                </button>
            </Dropdown>

            <div
                ref={hiddenUploadRef}
                className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
            >
                <ImgCrop rotationSlider aspect={1} quality={1}>
                    <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={beforeAvatarUpload}
                        customRequest={customUploadRequest}
                    >
                        <span>选择头像</span>
                    </Upload>
                </ImgCrop>
            </div>
        </ConfigProvider>
    );
}
