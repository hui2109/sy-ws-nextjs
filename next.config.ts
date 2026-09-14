import type {NextConfig} from "next";
import {withSerwist} from "@serwist/turbopack";

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "40mb",
        },
    },
};

export default withSerwist(nextConfig);
