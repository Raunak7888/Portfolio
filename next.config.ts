import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactCompiler: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "raw.githubusercontent.com",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
