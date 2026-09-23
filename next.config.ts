import type {NextConfig} from "next";
import {withSerwist} from "@serwist/turbopack";

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "40mb",
        },
    },

    async rewrites() {
        return {
            beforeFiles: [
                {
                    source: "/avatars/:filename",
                    destination: "/avatar/:filename",
                },
            ],
            afterFiles: [],
            fallback: [],
        };
    },
};

export default withSerwist(nextConfig);
