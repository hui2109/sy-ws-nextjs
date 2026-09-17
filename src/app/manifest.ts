import type {MetadataRoute} from "next";
import {AppName} from "@/configs/general";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: AppName,
        short_name: AppName,
        description: "排班、休假及假勤管理系统",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#000000",
        theme_color: "#4978eb",
        lang: "zh-CN",
        icons: [
            {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icons/icon-512.png",
                sizes: "512x512",
                type: "image/png",
            },
            {
                src: "/icons/icon-maskable-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
